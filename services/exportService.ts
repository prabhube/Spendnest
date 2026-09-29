import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { listExpenses } from '@/services/expenseService';
import { filterExpensesByMonth } from '@/utils/calculations';
import { expensesToCsv } from '@/utils/csv';
import { nowYearMonth } from '@/utils/dates';

export type ExportRange = 'month' | 'all';

function joinUri(directory: string, filename: string) {
  const base = directory.endsWith('/') ? directory : `${directory}/`;
  return `${base}${filename}`;
}

export async function exportExpenses(userId: string, range: ExportRange): Promise<number> {
  const all = await listExpenses(userId);
  const ym = nowYearMonth();
  const expenses = range === 'month' ? filterExpensesByMonth(all, ym) : all;

  if (expenses.length === 0) {
    throw new Error(
      range === 'month' ? 'No expenses this month to export.' : 'No expenses to export yet.'
    );
  }

  const csv = `\uFEFF${expensesToCsv(expenses)}`;
  const filename =
    range === 'month'
      ? `SpendNest-${ym.year}-${String(ym.month).padStart(2, '0')}.csv`
      : 'SpendNest-all-expenses.csv';

  if (Platform.OS === 'web') {
    downloadOnWeb(csv, filename);
    return expenses.length;
  }

  const directory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!directory) {
    await Share.share({ title: filename, message: expensesToCsv(expenses) });
    return expenses.length;
  }

  const fileUri = joinUri(directory, filename);
  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: Platform.OS === 'android' ? 'text/plain' : 'text/csv',
        dialogTitle: 'Export SpendNest expenses',
        UTI: 'public.plain-text',
      });
      return expenses.length;
    }
  } catch {
    // Fall through to the system share sheet with CSV text.
  }

  await Share.share({
    title: filename,
    message: expensesToCsv(expenses),
  });
  return expenses.length;
}

function downloadOnWeb(csv: string, filename: string) {
  const web = globalThis as {
    document?: {
      createElement: (tag: string) => {
        href: string;
        download: string;
        click: () => void;
      };
    };
    URL?: {
      createObjectURL: (blob: Blob) => string;
      revokeObjectURL: (url: string) => void;
    };
  };

  if (!web.document || !web.URL) {
    throw new Error('CSV export is not available on this device.');
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = web.URL.createObjectURL(blob);
  const link = web.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  web.URL.revokeObjectURL(url);
}
