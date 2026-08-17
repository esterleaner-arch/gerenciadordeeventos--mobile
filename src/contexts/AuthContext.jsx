import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

const TOKEN_KEY = 'GerenciadorEventos-token';

// Funções utilitárias isoladas para compatibilidade Web/Mobile
const getSecureItem = async (key) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const setSecureItem = async (key, value) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.setItem(key, value);
  }
  return await SecureStore.setItemAsync(key, value);
};

const deleteSecureItem = async (key) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.removeItem(key);
  }
  return await SecureStore.deleteItemAsync(key);
};

function decodificarToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarSessao() {
      try {
        // Ordem estrita de leitura para evitar concorrência no iOS
        const tokenSalvo = await getSecureItem(TOKEN_KEY);
        const adminIdSalvo = await AsyncStorage.getItem('@GerenciadorEventos:adminId');

        if (tokenSalvo && adminIdSalvo) {
          setUser({ id: adminIdSalvo });
        }
      } catch (err) {
        console.warn('Não foi possível restaurar a sessão.', err);
      } finally {
        setLoading(false);
      }
    }

    carregarSessao();
  }, []);

  const loginService = async (email, senha, lembrar) => {
    try {
      const response = await api.post('/auth/login', { email, senha });

      const token = response.data.token || response.data.tokenJwt;
      const dadosToken = decodificarToken(token);
      const id = response.data.id || response.data.adminId || response.data.admin?.id || dadosToken?.adminId;

      if (!token || !id) {
        throw new Error('Resposta incompleta do servidor.');
      }

      // Salvamentos sequenciais obrigatórios para estabilidade do iOS
      await setSecureItem(TOKEN_KEY, token);
      await AsyncStorage.setItem('@GerenciadorEventos:adminId', String(id));

      if (lembrar) {
        await AsyncStorage.setItem('@GerenciadorEventos:lembrarEmail', email);
        await AsyncStorage.setItem('@GerenciadorEventos:lembrarSenha', senha);
      } else {
        await AsyncStorage.removeItem('@GerenciadorEventos:lembrarEmail');
        await AsyncStorage.removeItem('@GerenciadorEventos:lembrarSenha');
      }

      setUser({ id: String(id) });
      return { token, id };
    } catch (error) {
      const msg = error.response?.data?.message || 'E-mail ou senha incorretos.';
      throw new Error(msg);
    }
  };

  const logoutService = async () => {
    try {
      await deleteSecureItem(TOKEN_KEY);
      await AsyncStorage.removeItem('@GerenciadorEventos:adminId');
    } catch (err) {
      console.warn('Falha ao limpar a sessão local.', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loginService, logoutService, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
