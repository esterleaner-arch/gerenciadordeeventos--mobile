import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

export default function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  editable,
  accessibilityLabel,
  autoComplete,
}) {
  const { colors, fontScale } = useSettings();
  const [visivel, setVisivel] = useState(false);
  const s = createStyles(colors, fontScale);

  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <View style={s.wrapper}>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!visivel}
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoComplete={autoComplete}
          accessibilityLabel={accessibilityLabel}
        />
        <TouchableOpacity
          style={s.toggle}
          onPress={() => setVisivel((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          accessibilityState={{ checked: visivel }}
          activeOpacity={0.7}
        >
          <Text style={s.toggleText}>{visivel ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    group: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14 * fontScale,
      fontWeight: '700',
      color: colors.mutedTeal,
      marginBottom: 6,
    },
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: colors.surfaceInput,
      borderWidth: 1,
      borderColor: 'rgba(82, 140, 157, 0.3)',
      borderRadius: 8,
      padding: 12,
      paddingRight: 46,
      fontSize: 16 * fontScale,
      color: colors.text,
    },
    toggle: {
      position: 'absolute',
      right: 6,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleText: {
      fontSize: 18,
    },
  });
}
