import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
}

/**
 * Reusable labeled text input field with error state support.
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerStyle,
  required = false,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined, inputProps.editable === false ? styles.inputDisabled : undefined]}
        placeholderTextColor="#9ca3af"
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  required: { color: '#ef4444' },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fff5f5' },
  inputDisabled: { backgroundColor: '#f9fafb', color: '#9ca3af' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4, marginLeft: 2 },
});
