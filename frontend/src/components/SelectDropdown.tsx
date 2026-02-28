import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, ViewStyle, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectDropdownProps {
  label: string;
  options: SelectOption[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

/**
 * Reusable dropdown selector with modal-based option picker.
 */
export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  containerStyle,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : undefined]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => String(item.value)}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => { onChange(item.value); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#22c55e" />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13, fontWeight: '600', color: '#374151',
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  required: { color: '#ef4444' },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e5e7eb',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
  },
  triggerError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  triggerText: { fontSize: 15, color: '#111827', fontWeight: '500' },
  placeholder: { color: '#9ca3af' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4, marginLeft: 2 },

  // Modal sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '70%', paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  optionSelected: { backgroundColor: '#f0fdf4' },
  optionText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  optionTextSelected: { color: '#16a34a', fontWeight: '700' },
});
