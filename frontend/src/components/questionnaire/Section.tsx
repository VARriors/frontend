import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { C } from './colors';

interface SectionProps {
  title: string;
  subtitle?: string;
  icon: any;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Section({
  title,
  subtitle,
  icon: Icon,
  iconColor = C.primary,
  iconBg = C.primaryLight,
  badge,
  badgeColor,
  children,
  defaultOpen = false,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const anim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = useCallback(() => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setOpen((o) => !o);
  }, [open, anim]);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        onPress={toggle}
        style={styles.sectionHeader}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${open ? 'zwiń' : 'rozwiń'} sekcję`}
      >
        <View style={[styles.sectionIconBg, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.sectionHeaderText}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badgeColor || C.primaryLight }]}>
                <Text style={[styles.badgeText, { color: badgeColor === C.successLight ? C.success : C.primary }]}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {open ? (
          <ChevronUp size={20} color={C.textMuted} />
        ) : (
          <ChevronDown size={20} color={C.textMuted} />
        )}
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeaderText: { flex: 1 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  sectionSubtitle: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
});
