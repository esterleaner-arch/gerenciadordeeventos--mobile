import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'GerenciadorEventos-token';

const api = axios.create({
  // IP do computador Windows onde o Spring Boot está rodando
  baseURL: 'http://192.168.0.204:8080/api',
  timeout: 10000,
});

// Interceptor: adiciona o JWT automaticamente nas requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn(
        'SecureStore indisponível, requisição sem token.',
        err
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;