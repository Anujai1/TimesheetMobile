import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import api from '../../api/apiClient';
import { useForm, Controller } from 'react-hook-form';
import { TextInput, Button } from 'react-native';

export default function AssignmentsScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(()=>{ load(); }, []);
  const load = async () => {
    try {
      const p = await api.get('/projects'); setProjects(p.data);
      // no endpoint for users in mock; derive from timesheets/users array: create quick local user list
      const uRes = await api.get('/auth/me').catch(()=>null);
      // we'll mock users for selection:
      setUsers([{id:'u1', email:'user@example.com'},{id:'m1', email:'manager@example.com'}]);
    } catch (e){ console.warn(e); }
  };

  const assign = async (projectId:string, userId:string) => {
    try {
      await api.post('/assignments', { projectId, userId, startDate: new Date().toISOString().slice(0,10) });
      Alert.alert('Assigned','Project assigned to user');
    } catch (e:any) { Alert.alert('Error', e?.response?.data?.message ?? 'Failed'); }
  };

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={{fontWeight:'600'}}>Projects</Text>
      <FlatList data={projects} keyExtractor={i=>i.id} renderItem={({item}) => (
        <View style={styles.row}>
          <View><Text style={{fontWeight:'600'}}>{item.name}</Text><Text>{item.code}</Text></View>
          <View>
            {users.map(u => <TouchableOpacity key={u.id} onPress={()=>assign(item.id,u.id)} style={styles.assignBtn}><Text>Assign to {u.email}</Text></TouchableOpacity>)}
          </View>
        </View>
      )}/>
    </View>
  );
}
const styles = StyleSheet.create({
  row:{borderBottomWidth:1,borderColor:'#eee',padding:12},
  assignBtn:{padding:6, backgroundColor:'#eef', marginTop:6, borderRadius:6}
});