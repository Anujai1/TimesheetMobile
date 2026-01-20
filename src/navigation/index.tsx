import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TimesheetList from '../screens/Timesheet/TimesheetList';
import TimesheetEntry from '../screens/Timesheet/TimesheetEntry';
import { useAuth } from '../hooks/useAuth';
import ProjectList from '../screens/Manager/ProjectList';
import ProjectCreate from '../screens/Manager/ProjectCreate';
import AssignmentsScreen from '../screens/Manager/Assignments';
import ApprovalQueue from '../screens/Manager/ApprovalQueue';
import ReportsScreen from '../screens/Manager/Reports';

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
            <Stack.Screen name="ProjectList" component={ProjectList} />
            <Stack.Screen name="ProjectCreate" component={ProjectCreate} />
            <Stack.Screen name="Assignments" component={AssignmentsScreen} />
            <Stack.Screen name="ApprovalQueue" component={ApprovalQueue} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
