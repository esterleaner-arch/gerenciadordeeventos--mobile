import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  // ⚠️ SUBSTITUA PELO SEU ENDEREÇO IPV4 DO WINDOWS (Mantenha a porta 8080)
  baseURL: 'http://192.168.0.204', 
  timeout: 10000,
});

// Interceptor: Lê o token criptografado do celular e injeta no cabeçalho
api.interceptors.request.use(
  async (config) => {
    // Busca o token guardado no chip de segurança do aparelho móvel
    const token = await SecureStore.getItemAsync('@GerenciadorEventos:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
