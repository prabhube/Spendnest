import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

export default function Index() {
  const { loading, profile } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.forest} />
      </View>
    );
  }

  if (!profile) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
