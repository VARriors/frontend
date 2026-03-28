import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Lock, Shield } from 'lucide-react-native';
import { C } from './colors';

// ─── FormField wrapper ──────────────────────────────────────────
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, readOnly, children }: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, readOnly && styles.labelReadOnly]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {readOnly && <Lock size={12} color={C.readOnlyText} />}
      </View>
      {children}
      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── ReadOnlyInput ──────────────────────────────────────────────
export function ReadOnlyInput({ value }: { value: string }) {
  return (
    <View style={styles.readOnlyInput}>
      <Text style={styles.readOnlyValue}>{value}</Text>
      <Shield size={14} color={C.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  formField: { marginTop: 14 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  labelReadOnly: { color: C.readOnlyText },
  required: { color: C.danger, fontWeight: '700' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { fontSize: 12, color: C.danger, fontWeight: '500' },

  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.readOnlyBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.readOnlyBg,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 15,
    color: C.readOnlyText,
    fontWeight: '500',
  },
});
