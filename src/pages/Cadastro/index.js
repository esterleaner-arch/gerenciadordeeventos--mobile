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
import { useSettings } from '../../contexts/SettingsContext';
import PasswordInput from '../../components/PasswordInput';

export default function Cadastro() {
  const navigation = useNavigation();
  const { colors, fontScale } = useSettings();
  const s = createStyles(colors, fontScale);

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
      style={s.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.brand}>Gerenciador do Evento</Text>
          <Text style={s.title}>Cadastro do Administrador</Text>

          {erro ? (
            <View style={s.alertError} accessibilityRole="alert">
              <Text style={s.alertErrorText}>{erro}</Text>
            </View>
          ) : null}

          {sucesso ? (
            <View style={s.alertSuccess} accessibilityRole="alert">
              <Text style={s.alertSuccessText}>Administrador cadastrado com sucesso!</Text>
            </View>
          ) : null}

          <View style={s.inputGroup}>
            <Text style={s.label}>Nome do Administrador</Text>
            <TextInput
              style={s.input}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
              value={nome}
              onChangeText={setNome}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para nome completo"
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>E-mail</Text>
            <TextInput
              style={s.input}
              placeholder="exemplo@email.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!carregando}
              accessibilityLabel="Campo de entrada para e-mail"
            />
          </View>

          <PasswordInput
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="Mínimo 6 caracteres"
            editable={!carregando}
            accessibilityLabel="Campo de entrada para nova senha"
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Repita a senha digitada"
            editable={!carregando}
            accessibilityLabel="Campo de confirmação de senha"
            autoComplete="new-password"
          />

          <View style={s.actions}>
            <TouchableOpacity 
              style={s.buttonPrimary} 
              activeOpacity={0.8}
              onPress={handleCadastro}
              disabled={carregando}
              accessibilityRole="button"
            >
              {carregando ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Text style={s.buttonPrimaryText}>Salvar Cadastro</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.buttonSecondary} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
              disabled={carregando}
              accessibilityRole="button"
            >
              <Text style={s.buttonSecondaryText}>Voltar para o Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 25,
      elevation: 5,
      borderTopWidth: 6,
      borderTopColor: colors.accentCyan,
    },
    brand: {
      fontSize: 13 * fontScale,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.accentCyan,
      textAlign: 'center',
      marginBottom: 6,
    },
    title: {
      fontSize: 22 * fontScale,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 24,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14 * fontScale,
      fontWeight: '700',
      color: colors.mutedTeal,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surfaceInput,
      borderWidth: 1,
      borderColor: 'rgba(82, 140, 157, 0.3)',
      borderRadius: 8,
      padding: 12,
      fontSize: 16 * fontScale,
      color: colors.text,
    },
    actions: {
      gap: 12,
      marginTop: 8,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPrimaryText: {
      color: colors.textOnPrimary,
      fontSize: 16 * fontScale,
      fontWeight: '700',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      padding: 14,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.mutedTeal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondaryText: {
      color: colors.primary,
      fontSize: 16 * fontScale,
      fontWeight: '700',
    },
    alertError: {
      backgroundColor: colors.surfaceDanger,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
      padding: 12,
      borderRadius: 4,
      marginBottom: 16,
    },
    alertErrorText: {
      color: colors.error,
      fontWeight: '600',
      fontSize: 14 * fontScale,
    },
    alertSuccess: {
      backgroundColor: colors.success + '22',
      borderLeftWidth: 4,
      borderLeftColor: colors.success,
      padding: 12,
      borderRadius: 4,
      marginBottom: 16,
    },
    alertSuccessText: {
      color: colors.success,
      fontWeight: '600',
      fontSize: 14 * fontScale,
    },
  });
}
