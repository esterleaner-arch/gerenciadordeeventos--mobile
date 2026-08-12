import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

// Chave válida para o SecureStore
const TOKEN_KEY = 'GerenciadorEventos-token';

// Decodifica o payload do JWT para extrair o adminId
function decodificarToken(token) {
  try {
    const payload = token.split('.')[1];

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (c) =>
            '%' +
            c.charCodeAt(0)
              .toString(16)
              .padStart(2, '0')
        )
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
    // Restaura a sessão do administrador ao abrir o aplicativo
    async function carregarSessao() {
      try {
        const tokenSalvo = await SecureStore.getItemAsync(TOKEN_KEY);

        const adminIdSalvo = await AsyncStorage.getItem(
          '@GerenciadorEventos:adminId'
        );

        if (tokenSalvo && adminIdSalvo) {
          setUser({
            id: adminIdSalvo,
          });
        }
      } catch (err) {
        console.warn(
          'Não foi possível restaurar a sessão.',
          err
        );
      } finally {
        // Garante que a tela de carregamento sempre encerra
        setLoading(false);
      }
    }

    carregarSessao();
  }, []);

  const loginService = async (email, senha, lembrar) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        senha,
      });

      const token =
        response.data.token ||
        response.data.tokenJwt;

      // Decodifica o JWT para tentar obter o adminId
      const dadosToken = decodificarToken(token);

      const id =
        response.data.id ||
        response.data.adminId ||
        response.data.admin?.id ||
        dadosToken?.adminId;

      if (!token || !id) {
        throw new Error(
          'Resposta incompleta do servidor.'
        );
      }

      // Salva o JWT de forma segura
      await SecureStore.setItemAsync(
        TOKEN_KEY,
        token
      );

      // Salva o identificador do administrador
      await AsyncStorage.setItem(
        '@GerenciadorEventos:adminId',
        String(id)
      );

      // Grava e-mail e senha somente se o usuário marcar
      // "Gravar Senha"
      if (lembrar) {
        await AsyncStorage.setItem(
          '@GerenciadorEventos:lembrarEmail',
          email
        );

        await AsyncStorage.setItem(
          '@GerenciadorEventos:lembrarSenha',
          senha
        );
      } else {
        await AsyncStorage.removeItem(
          '@GerenciadorEventos:lembrarEmail'
        );

        await AsyncStorage.removeItem(
          '@GerenciadorEventos:lembrarSenha'
        );
      }

      setUser({
        id: String(id),
      });

      return {
        token,
        id,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'E-mail ou senha incorretos.';

      throw new Error(msg);
    }
  };

  const logoutService = async () => {
    try {
      // Remove o token armazenado no SecureStore
      await SecureStore.deleteItemAsync(
        TOKEN_KEY
      );

      // Remove o ID do administrador
      await AsyncStorage.removeItem(
        '@GerenciadorEventos:adminId'
      );
    } catch (err) {
      console.warn(
        'Falha ao limpar a sessão local.',
        err
      );
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loginService,
        logoutService,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}