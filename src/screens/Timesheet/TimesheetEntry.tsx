import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

type Project = { id: string; code?: string; name?: string };
type FormData = { projectId: string; date: string; hours: string; description?: string };

export default function TimesheetEntry() {
  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: { projectId: '', date: '', hours: '', description: '' },
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    (async () => {
      setLoadingProjects(true);
      try {
        const res = await api.get<Project[]>('/projects');
        setProjects(res.data);
      } catch (err) {
        console.warn('fetch projects error', err);
        // fallback to empty list
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  const onSubmit = async (data: FormData) => {
    // client-side validation
    const hoursNum = Number(data.hours);
    if (Number.isNaN(hoursNum) || hoursNum <= 0) {
      Alert.alert('Validation', 'Enter a valid hours value (> 0)');

      return;
    }
    if (hoursNum > 24) {
      Alert.alert('Validation', 'Hours cannot be more than 24');

      return;
    }
    if (!data.projectId) {
      Alert.alert('Validation', 'Select a project');

      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      Alert.alert('Validation', 'Enter date as YYYY-MM-DD');

      return;
    }

    setSubmitting(true);
    try {
      await api.post('/timesheets', {
        projectId: data.projectId,
        date: data.date,
        hours: hoursNum,
        description: data.description,
      });
      Alert.alert('Success', 'Timesheet saved');

      // navigate back to list
      nav.goBack();
    } catch (err: any) {
      console.warn('submit error', err);
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to save timesheet');

    } finally {
      setSubmitting(false);
    }
  };

  const selectedProjectId = watch('projectId');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.label}>Project</Text>

        <TouchableOpacity style={styles.projectSelect} onPress={() => setPickerOpen(true)}>
          <Text>{projects.find((p) => p.id === selectedProjectId)?.name ?? 'Choose project'}</Text>
        </TouchableOpacity>

        {loadingProjects && <ActivityIndicator />}

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <TextInput placeholder="2026-01-13" value={value} onChangeText={onChange} style={styles.input} />
          )}
        />

        <Text style={styles.label}>Hours</Text>
        <Controller
          control={control}
          name="hours"
          render={({ field: { onChange, value } }) => (
            <TextInput
              keyboardType="numeric"
              placeholder="e.g. 8"
              value={value}
              onChangeText={onChange}
              style={styles.input}
            />
          )}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput value={value} onChangeText={onChange} style={[styles.input, { height: 80 }]} multiline />
          )}
        />

        <View style={{ marginTop: 12 }}>
          <Button title={submitting ? 'Saving...' : 'Save'} onPress={handleSubmit(onSubmit)} disabled={submitting} />
        </View>

        {/* Project picker modal */}
        <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Select project</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)}>
                <Text style={{ color: '#1f6feb' }}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={projects}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setValue('projectId', item.id);
                    setPickerOpen(false);
                  }}
                  style={styles.projectRow}
                >
                  <Text style={{ fontWeight: '600' }}>{item.name ?? item.code ?? item.id}</Text>
                  <Text style={{ color: '#555' }}>{item.code ?? ''}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ padding: 16 }}>No projects</Text>}
            />
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 8, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 },
  projectSelect: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, justifyContent: 'center' },
  modalHeader: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projectRow: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
});
