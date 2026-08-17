import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'GerenciadorEventos-token';

// Configuração da URL base do seu servidor backend
const api = axios.create({
  baseURL: 'http://192.168.0.204:8080/api',
});

// Interceptor para injetar o token automaticamente em cada requisição
api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      // Busca o token de forma segura dependendo da plataforma ativa
      if (Platform.OS === 'web') {
        token = await AsyncStorage.getItem(TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('SecureStore indisponível, requisição sem token.', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
