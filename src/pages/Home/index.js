import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';

export default function Home() {
  const { logoutService, user } = useAuth();
  const { colors, fontScale } = useSettings();
  const s = createStyles(colors, fontScale);

  // Estados dos eventos
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Estados do formulário da Modal
  const [modalAberta, setModalAberta] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');

  // 🔴 1. BUSCAR EVENTOS DO SERVIDOR (GET por adminId)
  const carregarEventos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setErro('');
      const response = await api.get(`/eventos?adminId=${user.id}`);
      setEventos(response.data);
    } catch (err) {
      setErro('Falha ao sincronizar a lista de eventos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, [user]);

  // 🔴 2. SALVAR OU EDITAR EVENTO (POST / PUT)
  const handleSalvarEvento = async () => {
    if (!nome || !data || !localizacao) {
      Alert.alert('Aviso', 'Nome, data e localização são obrigatórios.');
      return;
    }

    // Trata o calendário do input de texto para array [ano, mes, dia] aceito pelo LocalDate
    let dataFormatada = data;
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      dataFormatada = [Number(ano), Number(mes), Number(dia)];
    } else if (data.includes('-')) {
      const [ano, mes, dia] = data.split('-');
      dataFormatada = [Number(ano), Number(mes), Number(dia)];
    }

    const payload = {
      nome: nome.trim(),
      data: dataFormatada,
      localizacao: localizacao.trim(),
      imagemUrl: (imagemUrl || '').trim() || null,
      adminId: Number(user.id)
    };

    try {
      if (editandoId) {
        // Requisito 5: Atualiza o evento baseada no ID
        await api.put(`/eventos/${editandoId}`, payload);
      } else {
        // Requisito 4: Adiciona um novo evento associado ao administrador
        await api.post('/eventos', payload);
      }

      await carregarEventos();
      fecharModal();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao salvar o evento.');
    }
  };

  // 🔴 3. DELETAR EVENTO (DELETE)
  const handleExcluir = async (id, nomeEvento) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente remover o evento "${nomeEvento}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/eventos/${id}`);
              setEventos(eventos.filter(evento => evento.id !== id));
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir o evento do servidor.');
            }
          }
        }
      ]
    );
  };

  const abrirEdicao = (evento) => {
    setEditandoId(evento.id);
    setNome(evento.nome);
    
    // Converte a data do array numérico vindo do banco [ano, mes, dia] para string exibível
    if (Array.isArray(evento.data)) {
      const [ano, mes, dia] = evento.data;
      setData(`${dia < 10 ? '0' + dia : dia}/${mes < 10 ? '0' + mes : mes}/${ano}`);
    } else {
      setData(evento.data);
    }
    
    setLocalizacao(evento.localizacao);
    setImagemUrl(evento.imagemUrl || '');
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
    setEditandoId(null);
    setNome('');
    setData('');
    setLocalizacao('');
    setImagemUrl('');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.brand}>Gerenciador do Evento</Text>
          <Text style={s.headerTitle}>Painel de Eventos</Text>
          <Text style={s.headerSubtitle}>Gerenciamento Mobile</Text>
        </View>
        <TouchableOpacity style={s.buttonLogout} onPress={logoutService} accessibilityRole="button">
          <Text style={s.buttonLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {erro ? (
        <View style={s.centerBox}><Text style={s.errorText}>{erro}</Text></View>
      ) : loading ? (
        <View style={s.centerBox}><ActivityIndicator size="large" color={colors.accentCyan} /></View>
      ) : (
        /* FlatList nativa substitui o Grid da Web garantindo performance de rolagem */
        <FlatList
          data={eventos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={s.listContainer}
          ListEmptyComponent={
            <Text style={s.emptyText}>Nenhum evento cadastrado ainda.</Text>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              {item.imagemUrl ? (
                <Image source={{ uri: item.imagemUrl }} style={s.cardImage} />
              ) : (
                <View style={s.cardImagePlaceholder}>
                  <Text style={s.cardImagePlaceholderText}>Sem imagem de capa</Text>
                </View>
              )}
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{item.nome}</Text>
                <Text style={s.cardText}>
                  <Text style={s.boldLabel}>Data: </Text>
                  {Array.isArray(item.data) ? `${item.data[2]}/${item.data[1]}/${item.data[0]}` : item.data}
                </Text>
                <Text style={s.cardText}>
                  <Text style={s.boldLabel}>Local: </Text>{item.localizacao}
                </Text>

                <View style={s.cardActions}>
                  <TouchableOpacity style={s.buttonEdit} onPress={() => abrirEdicao(item)} accessibilityRole="button">
                    <Text style={s.buttonEditText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.buttonDelete} onPress={() => handleExcluir(item.id, item.nome)} accessibilityRole="button">
                    <Text style={s.buttonDeleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Botão de Ação Flutuante para criar novos eventos */}
      <TouchableOpacity 
        style={s.fab} 
        onPress={() => setModalAberta(true)}
        accessibilityLabel="Adicionar novo evento"
        accessibilityRole="button"
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Formulário Mobile */}
      <Modal visible={modalAberta} animationType="slide" transparent onRequestClose={fecharModal}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editandoId ? 'Atualizar Evento' : 'Novo Evento'}</Text>
            
            <View style={s.form}>
              <View style={s.inputGroup}>
                <Text style={s.label}>Nome do Evento</Text>
                <TextInput style={s.input} value={nome} onChangeText={setNome} placeholder="Ex: Workshop Java" placeholderTextColor={colors.placeholder} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>Data</Text>
                <TextInput style={s.input} value={data} onChangeText={setData} placeholder="DD/MM/AAAA ou AAAA-MM-DD" placeholderTextColor={colors.placeholder} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>Localização</Text>
                <TextInput style={s.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Auditório Central" placeholderTextColor={colors.placeholder} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>URL da Imagem</Text>
                <TextInput style={s.input} value={imagemUrl} onChangeText={setImagemUrl} placeholder="https://..." placeholderTextColor={colors.placeholder} autoCapitalize="none" />
              </View>

              <View style={s.modalActions}>
                <TouchableOpacity style={s.buttonSave} onPress={handleSalvarEvento} accessibilityRole="button">
                  <Text style={s.buttonSaveText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.buttonCancel} onPress={fecharModal} accessibilityRole="button">
                  <Text style={s.buttonCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: colors.card, borderBottomWidth: 3, borderBottomColor: colors.accentLight },
    brand: { fontSize: 12 * fontScale, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: colors.accentCyan, marginBottom: 2 },
    headerTitle: { fontSize: 20 * fontScale, fontWeight: '800', color: colors.primary },
    headerSubtitle: { fontSize: 13 * fontScale, color: colors.mutedTeal, fontWeight: '600' },
    buttonLogout: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, borderWidth: 2, borderColor: colors.mutedTeal },
    buttonLogoutText: { color: colors.primary, fontWeight: '700', fontSize: 14 * fontScale },
    listContainer: { padding: 20, paddingBottom: 100 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: colors.error, fontWeight: '600', fontSize: 16 * fontScale, textAlign: 'center' },
    emptyText: { textAlign: 'center', color: colors.mutedTeal, fontSize: 16 * fontScale, marginTop: 40, fontWeight: '500' },
    card: { backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden', marginBottom: 20, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: 'rgba(82, 140, 157, 0.15)' },
    cardImage: { width: '100%', height: 180 },
    cardImagePlaceholder: { width: '100%', height: 180, backgroundColor: colors.bgSoft, justifyContent: 'center', alignItems: 'center' },
    cardImagePlaceholderText: { color: colors.mutedTeal, fontWeight: '600', fontSize: 15 * fontScale },
    cardContent: { padding: 16 },
    cardTitle: { fontSize: 18 * fontScale, fontWeight: '700', color: colors.primary, marginBottom: 8 },
    cardText: { fontSize: 15 * fontScale, color: colors.text, marginBottom: 4, lineHeight: 22 * fontScale },
    boldLabel: { color: colors.mutedTeal, fontWeight: '700' },
    cardActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    buttonEdit: { flex: 1, backgroundColor: colors.bgSoft, padding: 10, borderRadius: 6, alignItems: 'center' },
    buttonEditText: { color: colors.primary, fontWeight: '700', fontSize: 14 * fontScale },
    buttonDelete: { flex: 1, backgroundColor: colors.surfaceDanger, padding: 10, borderRadius: 6, alignItems: 'center' },
    buttonDeleteText: { color: colors.error, fontWeight: '700', fontSize: 14 * fontScale },
    fab: { position: 'absolute', right: 20, bottom: 76, backgroundColor: colors.accentCyan, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    fabText: { color: colors.textOnAccent, fontSize: 28 * fontScale, fontWeight: '600', marginTop: -2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(11, 26, 36, 0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.card, padding: 24, borderRadius: 16, borderTopWidth: 6, borderTopColor: colors.accentCyan, elevation: 10 },
    modalTitle: { fontSize: 20 * fontScale, fontWeight: '800', color: colors.primary, marginBottom: 16 },
    form: { gap: 12 },
    inputGroup: { gap: 4 },
    label: { fontSize: 14 * fontScale, fontWeight: '700', color: colors.mutedTeal },
    input: { backgroundColor: colors.surfaceInput, borderWidth: 1, borderColor: 'rgba(82, 140, 157, 0.3)', borderRadius: 8, padding: 12, fontSize: 16 * fontScale, color: colors.text },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
    buttonSave: { flex: 1, backgroundColor: colors.accentCyan, padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonSaveText: { color: colors.textOnAccent, fontWeight: '700', fontSize: 16 * fontScale },
    buttonCancel: { flex: 1, backgroundColor: colors.surfaceMuted, padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonCancelText: { color: colors.text, fontWeight: '700', fontSize: 16 * fontScale }
  });
}
