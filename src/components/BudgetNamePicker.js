import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BUDGET_NAME_PRESETS, isValidBudgetName } from '../context/BudgetContext';

export default function BudgetNamePicker({ value, onChange, autoFocusCustom = false }) {
  const [customName, setCustomName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  useEffect(() => {
    const preset = BUDGET_NAME_PRESETS.find((p) => p.label === value);
    if (preset) {
      setSelectedPresetId(preset.id);
      setCustomName('');
    } else if (value) {
      setSelectedPresetId(null);
      setCustomName(value);
    } else {
      setSelectedPresetId(null);
      setCustomName('');
    }
  }, [value]);

  const handlePresetPress = (preset) => {
    setSelectedPresetId(preset.id);
    setCustomName('');
    onChange(preset.label);
  };

  const handleCustomChange = (text) => {
    setCustomName(text);
    setSelectedPresetId(null);
    onChange(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.presetGrid}>
        {BUDGET_NAME_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.presetChip, isSelected && styles.presetChipSelected]}
              onPress={() => handlePresetPress(preset)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetIcon}>{preset.icon}</Text>
              <Text style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.orLabel}>or enter a custom name</Text>

      <TextInput
        style={styles.customInput}
        value={customName}
        onChangeText={handleCustomChange}
        placeholder="Custom budget name"
        placeholderTextColor="#bbb"
        maxLength={40}
        returnKeyType="done"
        autoCorrect={false}
        autoFocus={autoFocusCustom && !value}
        textAlign="center"
      />

      {!isValidBudgetName(value) && (
        <Text style={styles.requiredHint}>Pick a category or enter a name to continue</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  presetChip: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  presetChipSelected: {
    borderColor: '#1a6fd4',
    backgroundColor: '#f0f7ff',
  },
  presetIcon: {
    fontSize: 18,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,
  },
  presetLabelSelected: {
    color: '#1a6fd4',
    fontWeight: '600',
  },
  orLabel: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  customInput: {
    alignSelf: 'center',
    width: '85%',
    maxWidth: 280,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  requiredHint: {
    fontSize: 12,
    color: '#e53e3e',
    textAlign: 'center',
    marginTop: 10,
  },
});
