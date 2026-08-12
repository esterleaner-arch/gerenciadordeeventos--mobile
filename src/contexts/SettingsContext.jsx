import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme/palette';

// Escala de tamanho de letra (90% a 130%)
const FONTES = [0.9, 1, 1.1, 1.2, 1.3];

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [indiceFonte, setIndiceFonte] = useState(1);

  // Restaura as preferências de acessibilidade gravadas no aparelho
  useEffect(() => {
    (async () => {
      try {
        const temaSalvo = await AsyncStorage.getItem('@GerenciadorEventos:tema');
        if (temaSalvo === 'dark' || temaSalvo === 'light') {
          setTheme(temaSalvo);
        }

        const fonteSalva = await AsyncStorage.getItem('@GerenciadorEventos:fonte');
        if (fonteSalva) {
          const idx = FONTES.indexOf(parseFloat(fonteSalva));
          if (idx !== -1) setIndiceFonte(idx);
        }
      } catch (err) {
        console.error('Erro ao carregar preferências', err);
      }
    })();
  }, []);

  const toggleTheme = () => {
    setTheme((atual) => {
      const proximo = atual === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('@GerenciadorEventos:tema', proximo).catch(() => {});
      return proximo;
    });
  };

  const aumentarFonte = () => {
    setIndiceFonte((atual) => {
      const proximo = Math.min(atual + 1, FONTES.length - 1);
      AsyncStorage.setItem('@GerenciadorEventos:fonte', String(FONTES[proximo])).catch(() => {});
      return proximo;
    });
  };

  const diminuirFonte = () => {
    setIndiceFonte((atual) => {
      const proximo = Math.max(atual - 1, 0);
      AsyncStorage.setItem('@GerenciadorEventos:fonte', String(FONTES[proximo])).catch(() => {});
      return proximo;
    });
  };

  const fontScale = FONTES[indiceFonte];
  const colors = themes[theme];

  return (
    <SettingsContext.Provider
      value={{
        theme,
        colors,
        fontScale,
        toggleTheme,
        aumentarFonte,
        diminuirFonte,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  return useContext(SettingsContext);
}
