import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import api from '../../api/apiClient';

export default function Reports() {
  const [empHours,setEmpHours] = useState<any[]>([]);
  const [projHours,setProjHours] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);
  const load = async () => {
    try {
      setLoading(true);
      const e = await api.get('/reports/employee-hours?from=1970-01-01&to=2999-12-31');
      const p = await api.get('/reports/project-hours?from=1970-01-01&to=2999-12-31');
      setEmpHours(e.data); setProjHours(p.data);
    } catch (err) { Alert.alert('Error','Failed to load reports'); }
    finally { setLoading(false); }
  };

  if (loading) return <ActivityIndicator style={{flex:1}}/>;

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={styles.title}>Employee Hours</Text>
      <FlatList data={empHours} keyExtractor={(it)=>it.userId} renderItem={({item}) => <Text>{item.userEmail}: {item.hours}h</Text>} />
      <View style={{height:12}}/>
      <Text style={styles.title}>Project Hours</Text>
      <FlatList data={projHours} keyExtractor={(it)=>it.projectId} renderItem={({item}) => <Text>{item.projectName}: {item.hours}h</Text>} />
    </View>
  );
}
const styles = StyleSheet.create({ title:{fontWeight:'700', marginBottom:8} });