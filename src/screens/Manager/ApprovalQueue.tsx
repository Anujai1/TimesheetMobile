import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import api from '../../api/apiClient';

export default function ApprovalQueue() {
  const [items,setItems] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ fetchPending(); },[]);

  const fetchPending = async () => {
    try { setLoading(true); const res = await api.get('/timesheets'); setItems(res.data); }
    catch(e){ Alert.alert('Error','Failed to load'); }
    finally{ setLoading(false); }
  };

  const approve = async (id:string) => {
    try { await api.post(`/timesheets/${id}/approve`, { comment: 'OK' }); Alert.alert('Approved'); fetchPending(); }
    catch(e){ Alert.alert('Error','Approve failed'); }
  };
  const reject = async (id:string) => {
    try { await api.post(`/timesheets/${id}/reject`, { comment: 'Please correct' }); Alert.alert('Rejected'); fetchPending(); }
    catch(e){ Alert.alert('Error','Reject failed'); }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} />;

  return (
    <View style={{flex:1, padding:12}}>
      <FlatList data={items} keyExtractor={i=>i.id} renderItem={({item}) => (
        <View style={styles.row}>
          <Text style={{fontWeight:'600'}}>{item.projectName} — {item.date} — {item.hours}h</Text>
          <Text>{item.userId}</Text>
          <View style={{flexDirection:'row', marginTop:8}}>
            <TouchableOpacity style={styles.btn} onPress={()=>approve(item.id)}><Text>Approve</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn,{backgroundColor:'#fcc'}]} onPress={()=>reject(item.id)}><Text>Reject</Text></TouchableOpacity>
          </View>
        </View>
      )}/>
    </View>
  );
}
const styles = StyleSheet.create({ row:{borderBottomWidth:1,borderColor:'#eee',padding:12}, btn:{padding:8, backgroundColor:'#cfc', borderRadius:6, marginRight:8} });