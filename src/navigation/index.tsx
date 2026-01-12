import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TimesheetList from '../screens/Timesheet/TimesheetList';
import TimesheetEntry from '../screens/Timesheet/TimesheetEntry';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null; // simple loading fallback

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TimesheetList" component={TimesheetList} />
            <Stack.Screen name="TimesheetEntry" component={TimesheetEntry} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
