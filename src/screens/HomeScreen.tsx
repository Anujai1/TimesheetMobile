import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const nav = useNavigation();
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome, {user?.displayName ?? user?.email}</Text>

        <View style={styles.row}>
          <Button title="Timesheets" onPress={() => nav.navigate('TimesheetList' as never)} />
        </View>

        <View style={styles.row}>
          <Button title="New Entry" onPress={() => nav.navigate('TimesheetEntry' as never)} />
        </View>

        <View style={styles.row}>
          <Button title="Logout" onPress={() => signOut()} color="#d9534f" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  welcome: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  row: { marginVertical: 8 },
});
