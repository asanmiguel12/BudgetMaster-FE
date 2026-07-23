import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  useBudget,
  TIME_UNITS,
  formatTimeframe,
  formatTimeframePeriod,
  isValidBudgetName,
} from '../context/BudgetContext';
import BudgetNamePicker from './BudgetNamePicker';

const UNIT_OPTIONS = Object.entries(TIME_UNITS).map(([id, { label }]) => ({ id, label }));

const INITIAL_FORM = {
  step: 'name',
  unit: 'months',
  duration: 1,
  input: '',
  budgetName: '',
};

export default function BudgetSetupModal({ visible, onComplete, onClose, title }) {
  const { needsBudgetSetup, setBudgetSetup } = useBudget();
  const isVisible = visible ?? needsBudgetSetup;
  const [step, setStep] = useState(INITIAL_FORM.step);
  const [unit, setUnit] = useState(INITIAL_FORM.unit);
  const [duration, setDuration] = useState(INITIAL_FORM.duration);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [input, setInput] = useState(INITIAL_FORM.input);
  const [budgetName, setBudgetName] = useState(INITIAL_FORM.budgetName);

  useEffect(() => {
    if (isVisible) {
      setStep(INITIAL_FORM.step);
      setUnit(INITIAL_FORM.unit);
      setDuration(INITIAL_FORM.duration);
      setDropdownOpen(false);
      setInput(INITIAL_FORM.input);
      setBudgetName(INITIAL_FORM.budgetName);
    }
  }, [isVisible]);

  const parsed = parseFloat(input.replace(/,/g, ''));
  const isValidBudget = !isNaN(parsed) && parsed > 0;
  const isNameValid = isValidBudgetName(budgetName);
  const timeframe = { unit, duration: Math.round(duration) };
  const unitMax = TIME_UNITS[unit].max;

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setDropdownOpen(false);
    const max = TIME_UNITS[newUnit].max;
    if (duration > max) {
      setDuration(max);
    }
  };

  const handleSubmit = () => {
    if (!isValidBudget || !isNameValid) return;
    const tf = { unit, duration: Math.round(duration) };
    const trimmedName = budgetName.trim();
    if (onComplete) {
      onComplete(parsed, tf, trimmedName);
      onClose?.();
    } else {
      setBudgetSetup(parsed, tf, trimmedName);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (dropdownOpen) setDropdownOpen(false);
          else if (onClose) onClose();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {step === 'name' ? (
                <>
                  <Text style={styles.title}>{title ? 'Name this budget' : 'Name your budget'}</Text>
                  <Text style={styles.subtitle}>
                    Pick a category or enter a custom name. This is required.
                  </Text>

                  <BudgetNamePicker value={budgetName} onChange={setBudgetName} />

                  <TouchableOpacity
                    style={[styles.button, !isNameValid && styles.buttonDisabled]}
                    onPress={() => setStep('timeframe')}
                    disabled={!isNameValid}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </>
              ) : step === 'timeframe' ? (
                <>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep('name')}>
                    <Text style={styles.backText}>‹ Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.title}>{title || 'Choose your budget timeframe'}</Text>
                  <Text style={styles.subtitle}>
                    Pick a unit and slide to set the duration.
                  </Text>

                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={styles.dropdownBtn}
                      onPress={() => setDropdownOpen((open) => !open)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownBtnText}>{TIME_UNITS[unit].label}</Text>
                      <Text style={styles.dropdownChevron}>{dropdownOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {dropdownOpen && (
                      <View style={styles.dropdownMenu}>
                        {UNIT_OPTIONS.map(({ id, label }) => (
                          <TouchableOpacity
                            key={id}
                            style={[styles.dropdownItem, unit === id && styles.dropdownItemSelected]}
                            onPress={() => handleUnitChange(id)}
                          >
                            <Text style={[styles.dropdownItemText, unit === id && styles.dropdownItemTextSelected]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <Text style={styles.durationValue}>{formatTimeframe(timeframe)}</Text>

                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderBound}>1</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={unitMax}
                      step={1}
                      value={duration}
                      onValueChange={setDuration}
                      minimumTrackTintColor="#1a6fd4"
                      maximumTrackTintColor="#ddd"
                      thumbTintColor="#1a6fd4"
                    />
                    <Text style={styles.sliderBound}>{unitMax}</Text>
                  </View>

                  <TouchableOpacity style={styles.button} onPress={() => setStep('budget')}>
                    <Text style={styles.buttonText}>Continue</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.backBtn} onPress={() => setStep('timeframe')}>
                    <Text style={styles.backText}>‹ Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.title}>{title ? 'Set budget amount' : 'Set your budget'}</Text>
                  <Text style={styles.subtitle}>
                    How much for {budgetName} over the next {formatTimeframePeriod(timeframe)}?
                  </Text>

                  <View style={styles.inputRow}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={input}
                      onChangeText={setInput}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#bbb"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, !isValidBudget && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!isValidBudget}
                  >
                    <Text style={styles.buttonText}>{onComplete ? 'Add Budget' : 'Get Started'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1a6fd4',
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#1a6fd4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#f0f7ff',
  },
  dropdownBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a6fd4',
  },
  dropdownChevron: {
    fontSize: 12,
    color: '#1a6fd4',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f7ff',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#1a6fd4',
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2a8a2a',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderBound: {
    fontSize: 13,
    color: '#999',
    width: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2a8a2a',
    paddingBottom: 8,
    marginBottom: 32,
    width: '100%',
    justifyContent: 'center',
  },
  dollarSign: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2a8a2a',
    marginRight: 4,
  },
  input: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2a8a2a',
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  button: {
    backgroundColor: '#1a6fd4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
