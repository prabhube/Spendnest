export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
