import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { C } from './colors';

interface InlineDropdownProps {
  options: readonly string[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
}

export function InlineDropdown({ options, value, onSelect, placeholder }: InlineDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdownTrigger, open && styles.dropdownTriggerOpen]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${placeholder}: ${value || 'nie wybrano'}`}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        {open ? (
          <ChevronUp size={16} color={C.textMuted} />
        ) : (
          <ChevronDown size={16} color={C.textMuted} />
        )}
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, value === opt && styles.dropdownItemActive]}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === opt && styles.dropdownItemTextActive,
                  ]}
                >
                  {opt}
                </Text>
                {value === opt && <CheckCircle size={16} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surfaceElevated,
  },
  dropdownTriggerOpen: {
    borderColor: C.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: { flex: 1, fontSize: 15, color: C.text },
  dropdownPlaceholder: { color: C.textMuted },
  dropdownList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: C.surface,
    overflow: 'hidden',
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  dropdownItemActive: { backgroundColor: C.primaryLight },
  dropdownItemText: { flex: 1, fontSize: 14, color: C.text },
  dropdownItemTextActive: { color: C.primary, fontWeight: '600' },
});
