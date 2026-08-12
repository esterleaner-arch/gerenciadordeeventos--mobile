import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

// Decodifica o payload do JWT para extrair o adminId (o backend retorna apenas o token)
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
    // Restaura a sessão do administrador ao abrir o aplicativo móvel
    async function carregarSessao() {
      const tokenSalvo = await SecureStore.getItemAsync('@GerenciadorEventos:token');
      const adminIdSalvo = await AsyncStorage.getItem('@GerenciadorEventos:adminId');

      if (tokenSalvo && adminIdSalvo) {
        setUser({ id: adminIdSalvo });
      }
      setLoading(false);
    }
    carregarSessao();
  }, []);

  const loginService = async (email, senha, lembrar) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      const token = response.data.token || response.data.tokenJwt;
      // O backend retorna apenas o token; o adminId é extraído do payload do JWT
      const dadosToken = decodificarToken(token);
      const id = response.data.id || response.data.adminId || response.data.admin?.id || dadosToken?.adminId;

      if (!token || !id) {
        throw new Error("Resposta incompleta do servidor.");
      }

      // Salva de forma criptografada no chip do celular
      await SecureStore.setItemAsync('@GerenciadorEventos:token', token);
      // Salva o identificador numérico
      await AsyncStorage.setItem('@GerenciadorEventos:adminId', String(id));

      // Regra de Negócio: Grava e-mail e senha localmente se marcar "Gravar Senha"
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
    // Remove os dados do aparelho celular ao clicar em Sair
    await SecureStore.deleteItemAsync('@GerenciadorEventos:token');
    await AsyncStorage.removeItem('@GerenciadorEventos:adminId');
    setUser(null);
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
