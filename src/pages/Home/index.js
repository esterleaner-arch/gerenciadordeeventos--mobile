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
import api from '../../services/api';

export default function Home() {
  const { logoutService, user } = useAuth();

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
        // Requisito 5: Atualiza apenas data e localização baseada no ID do evento
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel de Eventos</Text>
          <Text style={styles.headerSubtitle}>Gerenciamento Mobile</Text>
        </View>
        <TouchableOpacity style={styles.buttonLogout} onPress={logoutService} accessibilityRole="button">
          <Text style={styles.buttonLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {erro ? (
        <View style={styles.centerBox}><Text style={styles.errorText}>{erro}</Text></View>
      ) : loading ? (
        <View style={styles.centerBox}><ActivityIndicator size="large" color="#044D78" /></View>
      ) : (
        /* FlatList nativa substitui o Grid da Web garantindo performance de rolagem */
        <FlatList
          data={eventos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum evento cadastrado ainda.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imagemUrl ? (
                <Image source={{ uri: item.imagemUrl }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardImagePlaceholderText}>Sem imagem de capa</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardText}>
                  <Text style={styles.boldLabel}>Data: </Text>
                  {Array.isArray(item.data) ? `${item.data[2]}/${item.data[1]}/${item.data[0]}` : item.data}
                </Text>
                <Text style={styles.cardText}>
                  <Text style={styles.boldLabel}>Local: </Text>{item.localizacao}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.buttonEdit} onPress={() => abrirEdicao(item)} accessibilityRole="button">
                    <Text style={styles.buttonEditText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buttonDelete} onPress={() => handleExcluir(item.id, item.nome)} accessibilityRole="button">
                    <Text style={styles.buttonDeleteText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Botão de Ação Flutuante para criar novos eventos */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalAberta(true)}
        accessibilityLabel="Adicionar novo evento"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Formulário Mobile */}
      <Modal visible={modalAberta} animationType="slide" transparent onRequestClose={fecharModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editandoId ? 'Atualizar Evento' : 'Novo Evento'}</Text>
            
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Evento</Text>
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Workshop Java" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data</Text>
                <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="DD/MM/AAAA ou AAAA-MM-DD" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Localização</Text>
                <TextInput style={styles.input} value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: Auditório Central" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>URL da Imagem</Text>
                <TextInput style={styles.input} value={imagemUrl} onChangeText={setImagemUrl} placeholder="https://..." autoCapitalize="none" />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.buttonSave} onPress={handleSalvarEvento} accessibilityRole="button">
                  <Text style={styles.buttonSaveText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCancel} onPress={fecharModal} accessibilityRole="button">
                  <Text style={styles.buttonCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// 🔴 CORREÇÃO: Adicionado o parêntese "(" obrigatório após o .create
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 3, borderBottomColor: '#89E1F0' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#044D78' },
  headerSubtitle: { fontSize: 13, color: '#3b6673', fontWeight: '600' },
  buttonLogout: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, borderWidth: 2, borderColor: '#3b6673' },
  buttonLogoutText: { color: '#044D78', fontWeight: '700', fontSize: 14 },
  listContainer: { padding: 20, paddingBottom: 100 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#dc2626', fontWeight: '600', fontSize: 16, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#3b6673', fontSize: 16, marginTop: 40, fontWeight: '500' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', marginBottom: 20, shadowColor: '#0b1a24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: 'rgba(82, 140, 157, 0.15)' },
  cardImage: { width: '100%', height: 180 },
  cardImagePlaceholder: { width: '100%', height: 180, backgroundColor: '#BED3CF', justifyContent: 'center', alignItems: 'center' },
  cardImagePlaceholderText: { color: '#3b6673', fontWeight: '600', fontSize: 15 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#044D78', marginBottom: 8 },
  cardText: { fontSize: 15, color: '#0b1a24', marginBottom: 4, lineHeight: 22 },
  boldLabel: { color: '#3b6673', fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  buttonEdit: { flex: 1, backgroundColor: '#BED3CF', padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonEditText: { color: '#044D78', fontWeight: '700', fontSize: 14 },
  buttonDelete: { flex: 1, backgroundColor: '#fee2e2', padding: 10, borderRadius: 6, alignItems: 'center' },
  buttonDeleteText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#14889c', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  fabText: { color: '#ffffff', fontSize: 28, fontWeight: '600', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11, 26, 36, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, borderTopWidth: 6, borderTopColor: '#14889c', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#044D78', marginBottom: 16 },
  form: { gap: 12 },
  inputGroup: { gap: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#3b6673' },
  input: { backgroundColor: '#f8fafb', borderWidth: 1, borderColor: 'rgba(82, 140, 157, 0.3)', borderRadius: 8, padding: 12, fontSize: 16, color: '#0b1a24' },
  disabledInput: { backgroundColor: '#e2e8f0', color: '#64748b' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  buttonSave: { flex: 1, backgroundColor: '#14889c', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonSaveText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  buttonCancel: { flex: 1, backgroundColor: '#e2e8f0', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonCancelText: { color: '#475569', fontWeight: '700', fontSize: 16 }
}); // 🔴 CORREÇÃO: Fechamento correto com parêntese e chave ");"
