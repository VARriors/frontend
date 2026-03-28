import {StyleSheet} from 'react-native';
import {C} from './colors';

// Wspólne style używane bezpośrednio w ekranach kwestionariusza
export const questionnaireStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: C.bg},
  scroll: {paddingHorizontal: 16, paddingTop: 8},

  // ── Page Header ──
  pageHeader: {paddingVertical: 20, paddingHorizontal: 4},
  pageHeaderIconRow: {marginBottom: 16},
  pageHeaderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    lineHeight: 22,
  },

  // ── Verified Banner ──
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.successLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  verifiedBannerText: {
    fontSize: 12,
    color: C.success,
    fontWeight: '600',
  },

  // ── Inputs ──
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.surfaceElevated,
  },
  inputError: {
    borderColor: C.danger,
    backgroundColor: C.dangerLight,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // ── Chips ──
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.chipBorder,
    backgroundColor: C.chipBg,
  },
  chipSelected: {
    borderColor: C.chipSelectedBorder,
    backgroundColor: C.chipSelectedBg,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.textSecondary,
  },
  chipTextSelected: {
    color: C.primary,
    fontWeight: '700',
  },

  // ── Field Array Card ──
  fieldArrayCard: {
    backgroundColor: C.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  fieldArrayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldArrayCardIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: C.textMuted,
    textTransform: 'uppercase',
  },

  // ── Date Row ──
  dateRow: {flexDirection: 'row', gap: 10},
  dateCol: {flex: 1},

  // ── Level Chips (języki) ──
  levelChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  levelChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.chipBorder,
    backgroundColor: C.chipBg,
  },
  levelChipActive: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
  levelChipTextActive: {
    color: C.primary,
  },

  // ── Fetch / Add Buttons ──
  fetchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
    backgroundColor: C.primaryLight,
    marginTop: 12,
  },
  fetchButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceElevated,
    marginTop: 12,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },

  // ── Footer ──
  footer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: C.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textOnPrimary,
  },
});
