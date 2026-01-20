import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const nav = useNavigation();
  const { user, signOut } = useAuth();

  const isManager = user?.role === 'Manager';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Timesheet App</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.displayName ?? user?.email}
        </Text>

        {/* EMPLOYEE ACTIONS */}
        {!isManager && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Employee</Text>

              <View style={styles.btn}>
                <Button
                  title="My Timesheets"
                  onPress={() => nav.navigate('TimesheetList' as never)}
                />
              </View>

              <View style={styles.btn}>
                <Button
                  title="Add Timesheet"
                  onPress={() => nav.navigate('TimesheetEntry' as never)}
                />
              </View>
            </View>
          </>
        )}

        {/* MANAGER ACTIONS */}
        {isManager && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manager</Text>

              <View style={styles.btn}>
                <Button
                  title="Manage Projects"
                  onPress={() => nav.navigate('ProjectList' as never)}
                />
              </View>

              <View style={styles.btn}>
                <Button
                  title="Assign Projects"
                  onPress={() => nav.navigate('Assignments' as never)}
                />
              </View>

              <View style={styles.btn}>
                <Button
                  title="Approve Timesheets"
                  onPress={() => nav.navigate('ApprovalQueue' as never)}
                />
              </View>

              <View style={styles.btn}>
                <Button
                  title="Reports"
                  onPress={() => nav.navigate('Reports' as never)}
                />
              </View>
            </View>
          </>
        )}

        {/* COMMON */}
        <View style={styles.logout}>
          <Button title="Logout" color="#d9534f" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 20, color: '#555' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  btn: { marginVertical: 6 },
  logout: { marginTop: 'auto' },
});