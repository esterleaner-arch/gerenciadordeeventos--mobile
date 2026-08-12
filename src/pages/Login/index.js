import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { loginService } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [gravarSenha, setGravarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Recupera e-mail e senha salvos localmente no celular se "Gravar Senha" foi marcado antes
  useEffect(() => {
    async function carregarCredenciaisSalvas() {
      try {
        const emailSalvo = await AsyncStorage.getItem('@GerenciadorEventos:lembrarEmail');
        const senhaSalva = await AsyncStorage.getItem('@GerenciadorEventos:lembrarSenha');
        if (emailSalvo && senhaSalva) {
          setEmail(emailSalvo);
          setSenha(senhaSalva);
          setGravarSenha(true);
        }
      } catch (err) {
        console.error('Erro ao carregar dados locais', err);
      }
    }
    carregarCredenciaisSalvas();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha todos os campos para continuar.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      // Dispara a autenticação móvel integrada ao Axios
      await loginService(email, senha, gravarSenha);
      // O redirecionamento para a Home acontece de forma automática pelo AuthContext
    } catch (err) {
      setErro(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    // KeyboardAvoidingView impede que o teclado virtual do celular cubra os campos de texto
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Login do Administrador</Text>

          {erro ? (
            <View style={styles.alertError} accessibilityRole="alert">
              <Text style={styles.alertErrorText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para e-mail"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua senha segura"
              placeholderTextColor="#94a3b8"
              secureTextEntry // Oculta os caracteres digitados
              autoCapitalize="none"
              autoCorrect={false}
              value={senha}
              onChangeText={setSenha}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para senha"
            />
          </View>

          {/* Área do Checkbox customizado de "Gravar Senha" */}
          <TouchableOpacity 
            style={styles.checkboxGroup} 
            activeOpacity={0.7}
            onPress={() => !carregando && setGravarSenha(!gravarSenha)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: gravarSenha }}
          >
            <View style={[styles.checkbox, gravarSenha && styles.checkboxChecked]}>
              {gravarSenha && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>Gravar Senha para acesso rápido</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.buttonPrimary} 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={carregando}
              accessibilityRole="button"
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonSecondary} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Cadastro')}
              disabled={carregando}
              accessibilityRole="button"
            >
              <Text style={styles.buttonSecondaryText}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilização baseada na paleta de cores tecnológica da Dell
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#044D78',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 5, // Sombra para dispositivos Android
    borderTopWidth: 6,
    borderTopColor: '#14889c', // Detalhe em Ciano
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#044D78', // Azul Escuro Principal
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b6673', // Muted Teal
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafb',
    borderWidth: 1,
    borderColor: 'rgba(82, 140, 157, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0b1a24',
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#14889c',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#14889c',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b6673',
  },
  actions: {
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: '#044D78',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3b6673',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: '#044D78',
    fontSize: 16,
    fontWeight: '700',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  alertErrorText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
});
