import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/apiClient';
import { useNavigation } from '@react-navigation/native';

type Form = { code:string; name:string; clientName?:string; billable?:boolean };

export default function ProjectCreate() {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { code:'', name:'', clientName:'', billable:true }});
  const nav = useNavigation();

  const onSubmit = async (data: Form) => {
    try {
      await api.post('/projects', data);
      Alert.alert('Success','Project created');
      // go back to list
      nav.goBack();
    } catch (e:any) {
      console.warn(e);
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to create');
    }
  };

  return (
    <View style={{flex:1,padding:12}}>
      <Text>Code</Text>
      <Controller control={control} name="code" render={({field:{onChange,value}})=>(<TextInput value={value} onChangeText={onChange} style={styles.input}/>)}/>
      <Text>Name</Text>
      <Controller control={control} name="name" render={({field:{onChange,value}})=>(<TextInput value={value} onChangeText={onChange} style={styles.input}/>)}/>
      <Text>Client</Text>
      <Controller control={control} name="clientName" render={({field:{onChange,value}})=>(<TextInput value={value} onChangeText={onChange} style={styles.input}/>)}/>
      <View style={{marginTop:12}}><Button title="Create" onPress={handleSubmit(onSubmit)} /></View>
    </View>
  );
}

const styles = StyleSheet.create({ input:{borderWidth:1,borderColor:'#ddd',padding:8, borderRadius:6, marginBottom:8} });
