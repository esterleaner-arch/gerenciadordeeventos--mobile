import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

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
      const id = response.data.id || response.data.adminId || response.data.admin?.id;

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
