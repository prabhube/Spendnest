import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const { profile, loading } = useAuth();
  const theme = useTheme();

  if (!loading && !profile) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.forest,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 68,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: 'Add',
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: ({ onPress }) => (
            <Pressable onPress={onPress} style={styles.addWrap}>
              <View style={[styles.addButton, { backgroundColor: theme.forest }]}>
                <Text style={styles.addLabel}>+</Text>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'pie-chart' : 'pie-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addWrap: {
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  addLabel: {
    color: '#FFFDF8',
    fontSize: 32,
    fontWeight: '600',
    marginTop: -2,
  },
});
