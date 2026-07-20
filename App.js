import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { BudgetProvider, useBudget } from './src/context/BudgetContext';
import BudgetSetupModal from './src/components/BudgetSetupModal';
import HomeScreen from './src/screens/HomeScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
    </View>
  );
}

function AppContent() {
  const { isLoadingBudget, needsBudgetSetup } = useBudget();

  if (isLoadingBudget) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 0.5,
              borderTopColor: '#eee',
              paddingBottom: 8,
              paddingTop: 8,
              height: 65,
            },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
            tabBarActiveTintColor: '#1a6fd4',
            tabBarInactiveTintColor: '#aaa',
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }} />
          <Tab.Screen name="Activity" component={ActivityScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} /> }} />
          <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} /> }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }} />
        </Tab.Navigator>
      </NavigationContainer>
      {needsBudgetSetup && <BudgetSetupModal />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <BudgetProvider>
        <AppContent />
      </BudgetProvider>
    </SafeAreaProvider>
  );
}