import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BudgetProvider } from './src/context/BudgetContext';

import HomeScreen from './src/screens/HomeScreen';
import IncomeScreen from './src/screens/IncomeScreen';
import BudgetScreen from './src/screens/BudgetScreen'; // <--- Revisa que este archivo exista

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <BudgetProvider>
      <NavigationContainer>
        <Tab.Navigator 
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            tabBarIcon: ({ color, size }) => {
              let iconName = route.name === 'Inicio' ? 'home' : 
                             route.name === 'Ingresos' ? 'cash' : 'pie-chart';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Inicio" component={HomeScreen} />
          <Tab.Screen name="Ingresos" component={IncomeScreen} />
          <Tab.Screen name="Presupuesto" component={BudgetScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </BudgetProvider>
  );
}