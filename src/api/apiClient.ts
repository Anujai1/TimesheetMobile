import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:3000';  // replace with your backend URL

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
