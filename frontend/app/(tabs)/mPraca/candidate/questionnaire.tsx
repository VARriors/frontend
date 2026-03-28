import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Shield,
  Lock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Languages,
  GraduationCap,
  Award,
  Heart,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
} from 'lucide-react-native';

import {
  questionnaireFormSchema,
  type QuestionnaireFormValues,
  BRANZE,
  WOJEWODZTWA,
  POZIOMY_JEZYKOWE,
} from '@/src/services/mPraca/candidate/data/questionnaireSchema';
import {
  QUESTIONNAIRE_DEFAULT_VALUES,
  MOCK_URZAD_PRACY_DATA,
} from '@/src/services/mPraca/candidate/data/questionnaireMockData';

// ═══════════════════════════════════════════════════════════════════
// KOLORY – Design System mObywatel
// ═══════════════════════════════════════════════════════════════════
const C = {
  primary: '#0052A5',
  primaryLight: '#E8F0FE',
  primaryDark: '#003D7A',
  accent: '#DC2626',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',

  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFD',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  readOnlyBg: '#F8FAFC',
  readOnlyBorder: '#CBD5E1',
  readOnlyText: '#64748B',

  chipBg: '#F1F5F9',
  chipSelectedBg: '#DBEAFE',
  chipBorder: '#CBD5E1',
  chipSelectedBorder: '#3B82F6',

  danger: '#EF4444',
  dangerLight: '#FEF2F2',
};

// ═══════════════════════════════════════════════════════════════════
// SEKCJA ROZWIJANA (Accordion)
// ═══════════════════════════════════════════════════════════════════
function Section({
  title,
  subtitle,
  icon: Icon,
  iconColor = C.primary,
  iconBg = C.primaryLight,
  badge,
  badgeColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
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
    <View style={s.sectionCard}>
      <TouchableOpacity
        onPress={toggle}
        style={s.sectionHeader}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${open ? 'zwiń' : 'rozwiń'} sekcję`}
      >
        <View style={[s.sectionIconBg, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={s.sectionHeaderText}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>{title}</Text>
            {badge && (
              <View style={[s.badge, { backgroundColor: badgeColor || C.primaryLight }]}>
                <Text style={[s.badgeText, { color: badgeColor === C.successLight ? C.success : C.primary }]}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={s.sectionSubtitle}>{subtitle}</Text>}
        </View>
        {open ? (
          <ChevronUp size={20} color={C.textMuted} />
        ) : (
          <ChevronDown size={20} color={C.textMuted} />
        )}
      </TouchableOpacity>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POLE FORMULARZA (wrapper)
// ═══════════════════════════════════════════════════════════════════
function FormField({
  label,
  error,
  required,
  readOnly,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={s.formField}>
      <View style={s.labelRow}>
        <Text style={[s.label, readOnly && s.labelReadOnly]}>
          {label}
          {required && <Text style={s.required}> *</Text>}
        </Text>
        {readOnly && <Lock size={12} color={C.readOnlyText} />}
      </View>
      {children}
      {error && (
        <View style={s.errorRow}>
          <AlertCircle size={12} color={C.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POLE READONLY (dane z mObywatela)
// ═══════════════════════════════════════════════════════════════════
function ReadOnlyInput({ value }: { value: string }) {
  return (
    <View style={s.readOnlyInput}>
      <Text style={s.readOnlyValue}>{value}</Text>
      <Shield size={14} color={C.primary} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DROPDOWN (Picker inline)
// ═══════════════════════════════════════════════════════════════════
function InlineDropdown({
  options,
  value,
  onSelect,
  placeholder,
}: {
  options: readonly string[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={[s.dropdownTrigger, open && s.dropdownTriggerOpen]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${placeholder}: ${value || 'nie wybrano'}`}
      >
        <Text style={[s.dropdownText, !value && s.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        {open ? (
          <ChevronUp size={16} color={C.textMuted} />
        ) : (
          <ChevronDown size={16} color={C.textMuted} />
        )}
      </TouchableOpacity>
      {open && (
        <View style={s.dropdownList}>
          <ScrollView style={s.dropdownScroll} nestedScrollEnabled>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.dropdownItem, value === opt && s.dropdownItemActive]}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.dropdownItemText,
                    value === opt && s.dropdownItemTextActive,
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

// ═══════════════════════════════════════════════════════════════════
// GŁÓWNY EKRAN KWESTIONARIUSZA
// ═══════════════════════════════════════════════════════════════════
export default function QuestionnaireScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingZUS, setIsLoadingZUS] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireFormSchema),
    defaultValues: QUESTIONNAIRE_DEFAULT_VALUES,
    mode: 'onBlur',
  });

  // ── Field Arrays ──────────────────────────────────────────────
  const doswiadczeniaArray = useFieldArray({ control, name: 'doswiadczenia_zawodowe' });
  const jezykiArray = useFieldArray({ control, name: 'jezyki' });
  const szkoleniaArray = useFieldArray({ control, name: 'szkolenia' });
  const certyfikatyArray = useFieldArray({ control, name: 'certyfikaty' });
  const aktywnoscArray = useFieldArray({ control, name: 'aktywnosc_dodatkowa' });

  // ── Pobierz dane z ZUS/UP ─────────────────────────────────────
  const handleFetchFromZUS = useCallback(() => {
    setIsLoadingZUS(true);
    // Symulacja pobrania danych z endpointu PUT /api/candidates/questionnaire/<id>/urzad-pracy
    setTimeout(() => {
      const existing = getValues('doswiadczenia_zawodowe') || [];
      const merged = [...existing, ...MOCK_URZAD_PRACY_DATA.doswiadczenia_zawodowe];
      setValue('doswiadczenia_zawodowe', merged, { shouldDirty: true });
      setIsLoadingZUS(false);
      Alert.alert(
        'Sukces',
        'Pobrano historię zatrudnienia z ZUS/Urzędu Pracy. Dane zostaną zweryfikowane automatycznie.',
        [{ text: 'OK' }],
      );
    }, 1500);
  }, [getValues, setValue]);

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = useCallback(
    (data: QuestionnaireFormValues) => {
      setIsSubmitting(true);

      // Payload do wysłania na backend – rozdzielony na źródła
      const mobywatelPayload = {
        fields: {
          imie: data.imie,
          nazwisko: data.nazwisko,
          pesel: data.pesel,
          dowod: data.dowod,
          niepelnosprawnosc: data.niepelnosprawnosc,
        },
      };

      const userInputPayload = {
        fields: {
          nr_telefonu: data.nr_telefonu,
          email: data.email,
          preferencje: data.preferencje,
          obszar_poszukiwan: `${data.wojewodztwo}${data.miasto ? ', ' + data.miasto : ''}`,
          jezyki: (data.jezyki || []).map((j) => `${j.jezyk} (${j.poziom})`),
          szkolenia: (data.szkolenia || []).map((sz) => sz.nazwa),
          certyfikaty: (data.certyfikaty || []).map((c) => c.nazwa),
          aktywnosc_dodatkowa: (data.aktywnosc_dodatkowa || []).map((a) => a.opis),
        },
      };

      const urzadPracyPayload = {
        fields: {
          doswiadczenia_zawodowe: data.doswiadczenia_zawodowe || [],
        },
      };

      // Log (demo – w produkcji: fetch() do odpowiednich endpointów)
      console.log('=== PEŁNY PAYLOAD ===');
      console.log('mObywatel:', JSON.stringify(mobywatelPayload, null, 2));
      console.log('User input:', JSON.stringify(userInputPayload, null, 2));
      console.log('Urząd Pracy:', JSON.stringify(urzadPracyPayload, null, 2));

      setTimeout(() => {
        setIsSubmitting(false);
        Alert.alert(
          '✅ Kwestionariusz zapisany',
          'Twoje dane zostały przesłane. Pola z mObywatela i ZUS są automatycznie zweryfikowane.',
          [{ text: 'OK' }],
        );
      }, 1200);
    },
    [],
  );

  // ── Preferencje (toggle chip) ─────────────────────────────────
  const togglePreference = useCallback(
    (category: string, currentValues: string[]) => {
      const next = currentValues.includes(category)
        ? currentValues.filter((c) => c !== category)
        : [...currentValues, category];
      setValue('preferencje', next, { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <View style={s.pageHeader}>
          <View style={s.pageHeaderIconRow}>
            <View style={s.pageHeaderIconBg}>
              <Shield size={24} color={C.textOnPrimary} />
            </View>
          </View>
          <Text style={s.pageTitle}>Profil Kandydata</Text>
          <Text style={s.pageSubtitle}>
            Uzupełnij dane, by stworzyć zweryfikowany profil w systemie mPraca.
            Pola oznaczone tarczą pobierane są z rejestrów państwowych.
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════
            SEKCJA 1: DANE Z mOBYWATELA (ReadOnly)
        ═══════════════════════════════════════════════════════ */}
        <Section
          title="Dane z mObywatel"
          subtitle="Pobrane z rejestru – nie można edytować"
          icon={Shield}
          iconColor={C.primary}
          iconBg={C.primaryLight}
          badge="Zweryfikowane"
          badgeColor={C.successLight}
          defaultOpen={true}
        >
          <View style={s.verifiedBanner}>
            <Shield size={14} color={C.success} />
            <Text style={s.verifiedBannerText}>
              Dane zweryfikowane przez system mObywatel
            </Text>
          </View>

          <FormField label="Imię" readOnly>
            <ReadOnlyInput value={getValues('imie')} />
          </FormField>

          <FormField label="Nazwisko" readOnly>
            <ReadOnlyInput value={getValues('nazwisko')} />
          </FormField>

          <FormField label="PESEL" readOnly>
            <ReadOnlyInput value={getValues('pesel')} />
          </FormField>

          <FormField label="Numer dowodu osobistego" readOnly>
            <ReadOnlyInput value={getValues('dowod')} />
          </FormField>

          <FormField label="Orzeczenie o niepełnosprawności" readOnly>
            <ReadOnlyInput value={getValues('niepelnosprawnosc') ? 'TAK' : 'NIE'} />
          </FormField>
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SEKCJA 2: KWESTIONARIUSZ (Edytowalne)
        ═══════════════════════════════════════════════════════ */}
        <Section
          title="Dane kontaktowe"
          subtitle="Uzupełnij telefon i e-mail"
          icon={Phone}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
          defaultOpen={true}
        >
          <Controller
            control={control}
            name="nr_telefonu"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Numer telefonu"
                error={errors.nr_telefonu?.message}
                required
              >
                <TextInput
                  style={[s.input, errors.nr_telefonu && s.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="+48 XXX XXX XXX"
                  placeholderTextColor={C.textMuted}
                  keyboardType="phone-pad"
                  accessibilityLabel="Numer telefonu"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Adres e-mail"
                error={errors.email?.message}
                required
              >
                <TextInput
                  style={[s.input, errors.email && s.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="jan.kowalski@example.com"
                  placeholderTextColor={C.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel="Adres e-mail"
                />
              </FormField>
            )}
          />
        </Section>

        {/* ── Preferencje branżowe ────────────────────────────── */}
        <Section
          title="Preferencje branżowe"
          subtitle="Wybierz interesujące Cię branże"
          icon={Briefcase}
          iconColor="#C026D3"
          iconBg="#FDF4FF"
          defaultOpen={true}
        >
          <Controller
            control={control}
            name="preferencje"
            render={({ field: { value } }) => (
              <FormField
                label="Branże"
                error={errors.preferencje?.message}
                required
              >
                <View style={s.chipsContainer}>
                  {BRANZE.map((branza) => {
                    const selected = value.includes(branza);
                    return (
                      <TouchableOpacity
                        key={branza}
                        style={[s.chip, selected && s.chipSelected]}
                        onPress={() => togglePreference(branza, value)}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={branza}
                      >
                        <Text style={[s.chipText, selected && s.chipTextSelected]}>
                          {branza}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </FormField>
            )}
          />
        </Section>

        {/* ── Obszar poszukiwań ────────────────────────────────── */}
        <Section
          title="Obszar poszukiwań"
          subtitle="Gdzie szukasz pracy?"
          icon={MapPin}
          iconColor="#EA580C"
          iconBg="#FFF7ED"
          defaultOpen={true}
        >
          <Controller
            control={control}
            name="wojewodztwo"
            render={({ field: { onChange, value } }) => (
              <FormField
                label="Województwo"
                error={errors.wojewodztwo?.message}
                required
              >
                <InlineDropdown
                  options={WOJEWODZTWA}
                  value={value}
                  onSelect={onChange}
                  placeholder="Wybierz województwo..."
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="miasto"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Miasto" error={errors.miasto?.message}>
                <TextInput
                  style={s.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="np. Warszawa (opcjonalne)"
                  placeholderTextColor={C.textMuted}
                  accessibilityLabel="Miasto"
                />
              </FormField>
            )}
          />
        </Section>

        {/* ═══════════════════════════════════════════════════════
            SEKCJA 3: DOŚWIADCZENIE I KOMPETENCJE (FieldArrays)
        ═══════════════════════════════════════════════════════ */}

        {/* ── Doświadczenie zawodowe ──────────────────────────── */}
        <Section
          title="Doświadczenie zawodowe"
          subtitle="Historia zatrudnienia"
          icon={Building}
          iconColor="#0284C7"
          iconBg="#E0F2FE"
          badge={`${doswiadczeniaArray.fields.length}`}
        >
          {/* Przycisk pobierania z ZUS */}
          <TouchableOpacity
            style={s.fetchButton}
            onPress={handleFetchFromZUS}
            disabled={isLoadingZUS}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Pobierz historię z ZUS lub Urzędu Pracy"
          >
            {isLoadingZUS ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Download size={16} color={C.primary} />
            )}
            <Text style={s.fetchButtonText}>
              {isLoadingZUS ? 'Pobieranie...' : 'Pobierz historię z ZUS / Urzędu Pracy'}
            </Text>
          </TouchableOpacity>

          {doswiadczeniaArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => doswiadczeniaArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń doświadczenie ${index + 1}`}
                >
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`doswiadczenia_zawodowe.${index}.stanowisko`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Stanowisko"
                    error={errors.doswiadczenia_zawodowe?.[index]?.stanowisko?.message}
                    required
                  >
                    <TextInput
                      style={[
                        s.input,
                        errors.doswiadczenia_zawodowe?.[index]?.stanowisko && s.inputError,
                      ]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Specjalista ds. IT"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`doswiadczenia_zawodowe.${index}.firma`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Firma"
                    error={errors.doswiadczenia_zawodowe?.[index]?.firma?.message}
                    required
                  >
                    <TextInput
                      style={[
                        s.input,
                        errors.doswiadczenia_zawodowe?.[index]?.firma && s.inputError,
                      ]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. GovTech Solutions"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <View style={s.dateRow}>
                <View style={s.dateCol}>
                  <Controller
                    control={control}
                    name={`doswiadczenia_zawodowe.${index}.od`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormField
                        label="Od"
                        error={errors.doswiadczenia_zawodowe?.[index]?.od?.message}
                        required
                      >
                        <TextInput
                          style={[
                            s.input,
                            errors.doswiadczenia_zawodowe?.[index]?.od && s.inputError,
                          ]}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="RRRR-MM"
                          placeholderTextColor={C.textMuted}
                        />
                      </FormField>
                    )}
                  />
                </View>
                <View style={s.dateCol}>
                  <Controller
                    control={control}
                    name={`doswiadczenia_zawodowe.${index}.do`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormField label="Do">
                        <TextInput
                          style={s.input}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="RRRR-MM lub puste"
                          placeholderTextColor={C.textMuted}
                        />
                      </FormField>
                    )}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={s.addButton}
            onPress={() =>
              doswiadczeniaArray.append({ stanowisko: '', firma: '', od: '', do: '' })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj doświadczenie"
          >
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj doświadczenie</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Języki obce ─────────────────────────────────────── */}
        <Section
          title="Języki obce"
          subtitle="Języki i ich poziomy"
          icon={Languages}
          iconColor="#059669"
          iconBg="#ECFDF5"
          badge={`${jezykiArray.fields.length}`}
        >
          {jezykiArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => jezykiArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń język ${index + 1}`}
                >
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`jezyki.${index}.jezyk`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Język"
                    error={errors.jezyki?.[index]?.jezyk?.message}
                    required
                  >
                    <TextInput
                      style={[s.input, errors.jezyki?.[index]?.jezyk && s.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Angielski"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`jezyki.${index}.poziom`}
                render={({ field: { onChange, value } }) => (
                  <FormField
                    label="Poziom"
                    error={errors.jezyki?.[index]?.poziom?.message}
                    required
                  >
                    <View style={s.levelChipRow}>
                      {POZIOMY_JEZYKOWE.map((lvl) => (
                        <TouchableOpacity
                          key={lvl}
                          style={[s.levelChip, value === lvl && s.levelChipActive]}
                          onPress={() => onChange(lvl)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              s.levelChipText,
                              value === lvl && s.levelChipTextActive,
                            ]}
                          >
                            {lvl}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </FormField>
                )}
              />
            </View>
          ))}

          <TouchableOpacity
            style={s.addButton}
            onPress={() => jezykiArray.append({ jezyk: '', poziom: 'B1' })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj język"
          >
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj język</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Szkolenia i Kursy ───────────────────────────────── */}
        <Section
          title="Szkolenia i Kursy"
          subtitle="Dodaj ukończone szkolenia"
          icon={GraduationCap}
          iconColor="#D97706"
          iconBg="#FFFBEB"
          badge={`${szkoleniaArray.fields.length}`}
        >
          {szkoleniaArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => szkoleniaArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń szkolenie ${index + 1}`}
                >
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`szkolenia.${index}.nazwa`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Nazwa szkolenia"
                    error={errors.szkolenia?.[index]?.nazwa?.message}
                    required
                  >
                    <TextInput
                      style={[s.input, errors.szkolenia?.[index]?.nazwa && s.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Kurs React Native"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`szkolenia.${index}.organizator`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Organizator">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Udemy (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`szkolenia.${index}.rok`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Rok">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. 2024 (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                      keyboardType="numeric"
                    />
                  </FormField>
                )}
              />
            </View>
          ))}

          <TouchableOpacity
            style={s.addButton}
            onPress={() => szkoleniaArray.append({ nazwa: '', organizator: '', rok: '' })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj szkolenie"
          >
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj szkolenie / kurs</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Certyfikaty ─────────────────────────────────────── */}
        <Section
          title="Certyfikaty"
          subtitle="Posiadane certyfikaty branżowe"
          icon={Award}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
          badge={`${certyfikatyArray.fields.length}`}
        >
          {certyfikatyArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => certyfikatyArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń certyfikat ${index + 1}`}
                >
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`certyfikaty.${index}.nazwa`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Nazwa certyfikatu"
                    error={errors.certyfikaty?.[index]?.nazwa?.message}
                    required
                  >
                    <TextInput
                      style={[s.input, errors.certyfikaty?.[index]?.nazwa && s.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. AWS Cloud Practitioner"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`certyfikaty.${index}.wystawca`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Wystawca">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Amazon (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`certyfikaty.${index}.data_wydania`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Data wydania">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. 2024-06 (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />
            </View>
          ))}

          <TouchableOpacity
            style={s.addButton}
            onPress={() =>
              certyfikatyArray.append({ nazwa: '', wystawca: '', data_wydania: '' })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj certyfikat"
          >
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj certyfikat</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Aktywność dodatkowa ──────────────────────────────── */}
        <Section
          title="Aktywność dodatkowa"
          subtitle="Wolontariat, projekty, działalność"
          icon={Heart}
          iconColor="#DC2626"
          iconBg="#FEF2F2"
          badge={`${aktywnoscArray.fields.length}`}
        >
          {aktywnoscArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => aktywnoscArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń aktywność ${index + 1}`}
                >
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`aktywnosc_dodatkowa.${index}.opis`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Opis aktywności"
                    error={errors.aktywnosc_dodatkowa?.[index]?.opis?.message}
                    required
                  >
                    <TextInput
                      style={[
                        s.input,
                        s.inputMultiline,
                        errors.aktywnosc_dodatkowa?.[index]?.opis && s.inputError,
                      ]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Wolontariat w fundacji..."
                      placeholderTextColor={C.textMuted}
                      multiline
                      numberOfLines={3}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`aktywnosc_dodatkowa.${index}.organizacja`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Organizacja">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. Caritas (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name={`aktywnosc_dodatkowa.${index}.okres`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Okres">
                    <TextInput
                      style={s.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="np. 2023 – obecnie (opcjonalne)"
                      placeholderTextColor={C.textMuted}
                    />
                  </FormField>
                )}
              />
            </View>
          ))}

          <TouchableOpacity
            style={s.addButton}
            onPress={() =>
              aktywnoscArray.append({ opis: '', organizacja: '', okres: '' })
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj aktywność"
          >
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj aktywność</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Spacer na dole ──────────────────────────────────── */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════
          FOOTER – przycisk zapisu
      ═══════════════════════════════════════════════════════ */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitButton, isSubmitting && s.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Zapisz kwestionariusz"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={C.textOnPrimary} />
          ) : (
            <>
              <Send size={18} color={C.textOnPrimary} />
              <Text style={s.submitButtonText}>Zapisz i wyślij kwestionariusz</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // ── Page Header ───────────────────────────────────────────────
  pageHeader: { paddingVertical: 20, paddingHorizontal: 4 },
  pageHeaderIconRow: { marginBottom: 16 },
  pageHeaderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
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

  // ── Section Accordion ─────────────────────────────────────────
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

  // ── Verified Banner ───────────────────────────────────────────
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

  // ── Form Field ────────────────────────────────────────────────
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

  // ── Inputs ────────────────────────────────────────────────────
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

  // ── ReadOnly Input ────────────────────────────────────────────
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

  // ── Chips ─────────────────────────────────────────────────────
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

  // ── Dropdown ──────────────────────────────────────────────────
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

  // ── Field Array Card ──────────────────────────────────────────
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

  // ── Date row ──────────────────────────────────────────────────
  dateRow: { flexDirection: 'row', gap: 10 },
  dateCol: { flex: 1 },

  // ── Level Chips (języki) ──────────────────────────────────────
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

  // ── Fetch / Add Buttons ───────────────────────────────────────
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

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    padding: 16,
    paddingBottom: 24,
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
    shadowOffset: { width: 0, height: 6 },
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
