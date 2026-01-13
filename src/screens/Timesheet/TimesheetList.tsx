import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';

type Entry = {
  id: string;
  date: string;
  hours: number;
  description?: string;
  status: string;
  projectId?: string;
  projectName?: string;
};

export default function TimesheetList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation();

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Entry[]>('/timesheets');
      setEntries(res.data);
    } catch (err) {
      console.warn('fetchEntries error', err);
      Alert.alert('Error', 'Failed to load timesheets');

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.addBtn} onPress={() => nav.navigate('TimesheetEntry' as never)}>
          <Text style={styles.addBtnText}>+ Add Timesheet</Text>
        </TouchableOpacity>

        <FlatList
          data={entries}
          keyExtractor={(it) => it.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item}>
              <Text style={styles.itemTitle}>
                {item.date} — {item.projectName ?? item.projectId} — {item.hours}h
              </Text>
              <Text style={styles.itemMeta}>
                {item.status} {item.description ? `— ${item.description}` : ''}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ padding: 16 }}>No timesheet entries found.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 12 },
  addBtn: { backgroundColor: '#1f6feb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: '600' },
  itemMeta: { color: '#555', marginTop: 4 },
});
