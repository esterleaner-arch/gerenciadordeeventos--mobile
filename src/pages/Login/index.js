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
import { useSettings } from '../../contexts/SettingsContext';
import PasswordInput from '../../components/PasswordInput';

export default function Login() {
  const { loginService } = useAuth();
  const navigation = useNavigation();
  const { colors, fontScale } = useSettings();
  const s = createStyles(colors, fontScale);

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
      style={s.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.title}>Gerenciador do Evento</Text>
          <Text style={s.subtitle}>Login do administrador</Text>

          {erro ? (
            <View style={s.alertError} accessibilityRole="alert">
              <Text style={s.alertErrorText}>{erro}</Text>
            </View>
          ) : null}

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
            placeholder="Sua senha segura"
            editable={!carregando}
            accessibilityLabel="Campo de entrada para senha"
          />

          {/* Área do Checkbox customizado de "Gravar Senha" */}
          <TouchableOpacity 
            style={s.checkboxGroup} 
            activeOpacity={0.7}
            onPress={() => !carregando && setGravarSenha(!gravarSenha)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: gravarSenha }}
          >
            <View style={[s.checkbox, gravarSenha && s.checkboxChecked]}>
              {gravarSenha && <View style={s.checkboxInner} />}
            </View>
            <Text style={s.checkboxLabel}>Gravar Senha para acesso rápido</Text>
          </TouchableOpacity>

          <View style={s.actions}>
            <TouchableOpacity 
              style={s.buttonPrimary} 
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={carregando}
              accessibilityRole="button"
            >
              {carregando ? (
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
              ) : (
                <Text style={s.buttonPrimaryText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.buttonSecondary} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Cadastro')}
              disabled={carregando}
              accessibilityRole="button"
            >
              <Text style={s.buttonSecondaryText}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilização baseada na paleta de cores tecnológica da Dell
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
      elevation: 5, // Sombra para dispositivos Android
      borderTopWidth: 6,
      borderTopColor: colors.accentCyan, // Detalhe em Ciano
    },
    title: {
      fontSize: 22 * fontScale,
      fontWeight: '800',
      color: colors.primary, // Azul Escuro Principal
      marginBottom: 4,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15 * fontScale,
      fontWeight: '600',
      color: colors.mutedTeal,
      marginBottom: 24,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14 * fontScale,
      fontWeight: '700',
      color: colors.mutedTeal, // Muted Teal
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
      borderColor: colors.accentCyan,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    checkboxChecked: {
      backgroundColor: colors.accentCyan,
    },
    checkboxInner: {
      width: 10,
      height: 10,
      backgroundColor: colors.textOnAccent,
      borderRadius: 2,
    },
    checkboxLabel: {
      fontSize: 14 * fontScale,
      fontWeight: '600',
      color: colors.mutedTeal,
    },
    actions: {
      gap: 12,
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
  });
}
