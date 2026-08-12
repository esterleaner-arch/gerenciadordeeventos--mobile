import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

export default function AccessibilityBar() {
  const { theme, colors, fontScale, toggleTheme, aumentarFonte, diminuirFonte } = useSettings();
  const escuro = theme === 'dark';
  const s = createStyles(colors);

  return (
    <View style={s.bar} accessibilityLabel="Ferramentas de acessibilidade">
      <TouchableOpacity
        style={s.button}
        onPress={diminuirFonte}
        accessibilityRole="button"
        accessibilityLabel="Diminuir tamanho da letra"
        activeOpacity={0.7}
      >
        <Text style={s.buttonText}>A−</Text>
      </TouchableOpacity>

      <Text style={s.level} accessibilityLabel={`Tamanho da letra ${Math.round(fontScale * 100)} por cento`}>
        {Math.round(fontScale * 100)}%
      </Text>

      <TouchableOpacity
        style={s.button}
        onPress={aumentarFonte}
        accessibilityRole="button"
        accessibilityLabel="Aumentar tamanho da letra"
        activeOpacity={0.7}
      >
        <Text style={s.buttonText}>A+</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.button}
        onPress={toggleTheme}
        accessibilityRole="button"
        accessibilityLabel={escuro ? 'Ativar modo claro' : 'Ativar modo escuro'}
        accessibilityState={{ checked: escuro }}
        activeOpacity={0.7}
      >
        <Text style={s.buttonText}>{escuro ? '☀️ Claro' : '🌙 Escuro'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: 'rgba(82, 140, 157, 0.35)',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 6,
      zIndex: 9999,
      elevation: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    button: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    buttonText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 15,
    },
    level: {
      minWidth: 44,
      textAlign: 'center',
      color: colors.mutedTeal,
      fontWeight: '700',
      fontSize: 13,
    },
  });
}
