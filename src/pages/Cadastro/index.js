import React, { useState } from 'react';
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
import api from '../../services/api';

export default function Cadastro() {
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async () => {
    // Validação de campos vazios
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    setErro('');
    setSucesso(false);

    // Requisito Obrigatório: Valida se a senha coincide com o campo de confirmação
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Verifique os campos e tente novamente.');
      return;
    }

    setCarregando(true);

    try {
      // Dispara o POST real para a rota /auth mapeada no Spring Boot
      await api.post('/auth/register', {
        nome: nome.trim(),
        email: email.trim(),
        senha: senha
      });

      // Exibe a mensagem de sucesso exigida no requisito
      setSucesso(true);
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');

      // Aguarda 2 segundos com o feedback na tela e retorna para o Login
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao realizar o cadastro. Tente novamente.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Cadastro do Administrador</Text>

          {erro ? (
            <View style={styles.alertError} accessibilityRole="alert">
              <Text style={styles.alertErrorText}>{erro}</Text>
            </View>
          ) : null}

          {sucesso ? (
            <View style={styles.alertSuccess} accessibilityRole="alert">
              <Text style={styles.alertSuccessText}>Administrador cadastrado com sucesso!</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Administrador</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              value={nome}
              onChangeText={setNome}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para nome completo"
            />
          </View>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={senha}
              onChangeText={setSenha}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para nova senha"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha digitada"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              editable={!carregando}
              accessibilityLabel="Campo de confirmação de senha"
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.buttonPrimary} 
              activeOpacity={0.8}
              onPress={handleCadastro}
              disabled={carregando}
              accessibilityRole="button"
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Salvar Cadastro</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonSecondary} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
              disabled={carregando}
              accessibilityRole="button"
            >
              <Text style={styles.buttonSecondaryText}>Voltar para o Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    elevation: 5,
    borderTopWidth: 6,
    borderTopColor: '#14889c',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#044D78',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b6673',
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
  actions: {
    gap: 12,
    marginTop: 8,
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
  alertSuccess: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#15803d',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  alertSuccessText: {
    color: '#15803d',
    fontWeight: '600',
    fontSize: 14,
  },
});
