import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Iconos integrados
import { BudgetProvider } from './src/context/BudgetContext';

import HomeScreen from './src/screens/HomeScreen';
import IncomeScreen from './src/screens/IncomeScreen';
import BudgetScreen from './src/screens/BudgetScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <BudgetProvider>
      <NavigationContainer>
        <Tab.Navigator 
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Inicio') iconName = 'home';
              else if (route.name === 'Ingresos') iconName = 'cash';
              else if (route.name === 'Presupuesto') iconName = 'pie-chart';
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