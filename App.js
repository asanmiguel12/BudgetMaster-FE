import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BudgetProvider, useBudget } from './src/context/BudgetContext';
import BudgetSetupModal from './src/components/BudgetSetupModal';
import FloatingTabBar from './src/components/FloatingTabBar';
import HomeScreen from './src/screens/HomeScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { isLoadingBudget, needsBudgetSetup } = useBudget();

  if (isLoadingBudget) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Activity" component={ActivityScreen} />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
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
