import React from 'react';
import 'react-native-gesture-handler'; // Obrigatório no topo para o sistema de gestos móveis
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import Routes from './src/routes';
import AccessibilityBar from './src/components/AccessibilityBar';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { theme } = useSettings();

  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Routes />
      </AuthProvider>
      {/* ♿ Ferramentas de acessibilidade globais (dark + tamanho de letra) */}
      <AccessibilityBar />
    </NavigationContainer>
  );
}
