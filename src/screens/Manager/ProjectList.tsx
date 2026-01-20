import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import api from '../../api/apiClient';
import { useNavigation } from '@react-navigation/native';

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigation();

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) { console.warn(e); Alert.alert('Error','Failed to load projects'); }
    finally { setLoading(false); }
  };

  return (
    <View style={{flex:1, padding:12}}>
      <Button title="Create Project" onPress={() => nav.navigate('ProjectCreate' as never)} />
      {loading ? <ActivityIndicator/> : (
        <FlatList data={projects} keyExtractor={p => p.id} renderItem={({item}) => (
          <TouchableOpacity style={styles.item}>
            <Text style={{fontWeight:'600'}}>{item.name} ({item.code})</Text>
            <Text>{item.clientName} — {item.billable ? 'Billable' : 'Non-billable'}</Text>
          </TouchableOpacity>
        )}/>
      )}
    </View>
  );
}
const styles = StyleSheet.create({ item:{ padding:12, borderBottomWidth:1, borderColor:'#eee' }});