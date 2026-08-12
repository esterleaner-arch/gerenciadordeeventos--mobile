import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Importação das futuras telas móveis
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import Home from '../pages/Home';

const Stack = createStackNavigator();

export default function Routes() {
  const { signed } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Oculta a barra de topo padrão do sistema móvel
        cardStyle: { backgroundColor: '#f4f7f6' } // Aplica o fundo padrão tecnológico
      }}
    >
      {signed ? (
        // Fluxo Protegido: Se o Administrador estiver logado, exibe apenas a Home
        <Stack.Screen name="Home" component={Home} />
      ) : (
        // Fluxo Público: Telas acessíveis sem token de autenticação
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Cadastro" component={Cadastro} />
        </>
      )}
    </Stack.Navigator>
  );
}
