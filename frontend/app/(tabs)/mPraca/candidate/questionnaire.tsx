import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, Controller, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  Shield,
  Phone,
  Briefcase,
  MapPin,
  Languages,
  GraduationCap,
  Award,
  Heart,
  Plus,
  Trash2,
  Download,
  Send,
  Building,
} from 'lucide-react-native';

// ── Questionnaire components ──
import {
  C,
  Section,
  FormField,
  ReadOnlyInput,
  InlineDropdown,
  questionnaireStyles as s,
} from '@/src/components/questionnaire';

// ── CV components ──
import CVUpload from '@/src/services/mPraca/candidate/components/CVUpload';
import CVExtractionPreview from '@/src/services/mPraca/candidate/components/CVExtractionPreview';

// ── Data / Schema ──
import {
  questionnaireFormSchema,
  type QuestionnaireFormValues,
  BRANZE,
  WOJEWODZTWA,
  POZIOMY_JEZYKOWE,
} from '@/src/services/mPraca/candidate/data/questionnaireSchema';
import {QUESTIONNAIRE_DEFAULT_VALUES} from '@/src/services/mPraca/candidate/data/questionnaireMockData';
import {
  buildMobywatelPayload,
  buildUrzadPracyPayload,
  buildUserInputPayload,
  applyToJob,
  getCandidateContext,
  getQuestionnaire,
  mapQuestionnaireToFormValues,
  putMobywatel,
  putUrzadPracy,
  putUserInput,
  uploadCV,
  getCV,
  deleteCV,
} from '@/src/services/mPraca/candidate/api/questionnaireApi';
import {useLocalSearchParams, useRouter} from 'expo-router';

// ═══════════════════════════════════════════════════════════════════
// GŁÓWNY EKRAN KWESTIONARIUSZA
// ═══════════════════════════════════════════════════════════════════
export default function QuestionnaireScreen() {
  const params = useLocalSearchParams<{jobId?: string; employerId?: string}>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingZUS, setIsLoadingZUS] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── CV State ──
  const [cvData, setCvData] = useState<any>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);
  const [isCvAutoFilled, setIsCvAutoFilled] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: {errors},
  } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(questionnaireFormSchema),
    defaultValues: QUESTIONNAIRE_DEFAULT_VALUES,
    mode: 'onBlur',
  });

  // ── Field Arrays ──
  const doswiadczeniaArray = useFieldArray({control, name: 'doswiadczenia_zawodowe'});
  const jezykiArray = useFieldArray({control, name: 'jezyki'});
  const szkoleniaArray = useFieldArray({control, name: 'szkolenia'});
  const certyfikatyArray = useFieldArray({control, name: 'certyfikaty'});
  const aktywnoscArray = useFieldArray({control, name: 'aktywnosc_dodatkowa'});

  const loadQuestionnaire = useCallback(
    async (id: string) => {
      const questionnaire = await getQuestionnaire(id);
      reset(mapQuestionnaireToFormValues(questionnaire));
    },
    [reset],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setIsInitialLoading(true);
      setLoadError(null);

      try {
        const context = await getCandidateContext();
        if (!active) {
          return;
        }

        setCandidateId(context.candidateId);
        await loadQuestionnaire(context.candidateId);

        const cvInfo = await getCV(context.candidateId);
        if (active) {
          setCvData(cvInfo.cv);
          setIsCvAutoFilled(false);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Nie udało się pobrać danych kandydata.';
        setLoadError(message);
      } finally {
        if (active) {
          setIsInitialLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [loadQuestionnaire]);

  // ── Prześlij doświadczenie do Urzędu Pracy (weryfikacja źródła) ──
  const handleFetchFromZUS = useCallback(async () => {
    if (!candidateId) {
      Alert.alert('Brak kandydata', 'Nie znaleziono kontekstu kandydata.');
      return;
    }

    setIsLoadingZUS(true);

    try {
      await putUrzadPracy(candidateId, buildUrzadPracyPayload(getValues()));
      console.log('RELOADING loadQuestionnaire');
      console.log('SENDING loadQuestionnaire');
      await loadQuestionnaire(candidateId);
      console.log('OK loadQuestionnaire');
      console.log('OK loadQuestionnaire');
      Alert.alert(
        'Sukces',
        'Historia zatrudnienia została zapisana i zweryfikowana przez Urząd Pracy.',
        [{text: 'OK'}],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Nie udało się zapisać historii zatrudnienia.';
      Alert.alert('Błąd', message, [{text: 'OK'}]);
    } finally {
      setIsLoadingZUS(false);
    }
  }, [candidateId, getValues, loadQuestionnaire]);

  // ── CV Upload Handler ──
  const handleCVUpload = useCallback(
    async (fileData: {uri: string; name: string; type: string}) => {
      if (!candidateId) {
        setCvUploadError('Nie znaleziono kontekstu kandydata');
        return;
      }

      setIsUploadingCV(true);
      setCvUploadError(null);

      try {
        const result = await uploadCV(candidateId, fileData);

        // Update CV data in state
        setCvData(result);

        // Update form with extracted data if available
        if (result.extracted_data) {
          const currentValues = getValues();
          const nextValues: QuestionnaireFormValues = {
            ...currentValues,
            email: result.extracted_data.email || currentValues.email,
            nr_telefonu: result.extracted_data.phone || currentValues.nr_telefonu,
          };

          if (result.extracted_data.email) {
            setValue('email', result.extracted_data.email, {shouldValidate: true});
          }
          if (result.extracted_data.phone) {
            setValue('nr_telefonu', result.extracted_data.phone, {shouldValidate: true});
          }

          // Persist contact data extracted from CV so mock defaults are replaced
          // even after refreshing/reloading questionnaire.
          if (result.extracted_data.email || result.extracted_data.phone) {
            await putUserInput(candidateId, buildUserInputPayload(nextValues));
          }

          setIsCvAutoFilled(
            Boolean(
              result.extracted_data.email ||
              result.extracted_data.phone ||
              (Array.isArray(result.extracted_data.languages) &&
                result.extracted_data.languages.length > 0),
            ),
          );
        }

        Alert.alert(
          'Sukces',
          'CV przesłane i przeanalizowane.\n\nWyekstrahowane dane zostały wyświetlone poniżej.',
          [{text: 'OK'}],
        );

        // Reload questionnaire to sync CV field
        await loadQuestionnaire(candidateId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nie udało się przesłać CV.';
        setCvUploadError(message);
        Alert.alert('Błąd przesłania CV', message, [{text: 'OK'}]);
      } finally {
        setIsUploadingCV(false);
      }
    },
    [candidateId, getValues, setValue, loadQuestionnaire],
  );

  // ── CV Delete Handler ──
  const handleCVDelete = useCallback(async () => {
    if (!candidateId) {
      Alert.alert('Błąd', 'Nie znaleziono kontekstu kandydata.');
      return;
    }

    setIsUploadingCV(true);

    try {
      const extracted = cvData?.extracted_data;
      await deleteCV(candidateId);
      setCvData(null);
      setCvUploadError(null);
      setIsCvAutoFilled(false);

      if (extracted?.email) {
        setValue('email', '', {shouldValidate: true, shouldDirty: true});
      }
      if (extracted?.phone) {
        setValue('nr_telefonu', '', {shouldValidate: true, shouldDirty: true});
      }
      if (Array.isArray(extracted?.languages) && extracted.languages.length > 0) {
        jezykiArray.replace([]);
        setValue('jezyki', [], {shouldValidate: true, shouldDirty: true});
      }

      Alert.alert('Usunięte', 'CV zostało usunięte.', [{text: 'OK'}]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się usunąć CV.';
      Alert.alert('Błąd', message, [{text: 'OK'}]);
    } finally {
      setIsUploadingCV(false);
    }
  }, [candidateId, cvData, jezykiArray, setValue]);

  // ── CV Auto-fill Handler ──
  const handleCVAutoFill = useCallback(
    (extractedData: any) => {
      if (extractedData.email) {
        setValue('email', extractedData.email, {shouldValidate: true, shouldDirty: true});
      }
      if (extractedData.phone) {
        setValue('nr_telefonu', extractedData.phone, {shouldValidate: true, shouldDirty: true});
      }

      if (extractedData.languages && extractedData.languages.length > 0) {
        const normalizedLanguages = extractedData.languages.map((lang: any) => {
          const rawLevel = typeof lang?.poziom === 'string' ? lang.poziom : 'B1';
          const normalizedLevel = POZIOMY_JEZYKOWE.includes(rawLevel as any) ? rawLevel : 'B1';

          return {
            jezyk: typeof lang?.jezyk === 'string' ? lang.jezyk : '',
            poziom: normalizedLevel,
          };
        });

        jezykiArray.replace(normalizedLanguages);
        setValue('jezyki', normalizedLanguages, {shouldValidate: true, shouldDirty: true});
      }

      Alert.alert('Wstawione', 'Wyekstrahowane dane zostały wstawione do formularza.', [
        {text: 'OK'},
      ]);
      setIsCvAutoFilled(true);
    },
    [jezykiArray, setValue],
  );

  // ── Submit ──
  const onSubmit = useCallback(
    async (data: QuestionnaireFormValues) => {
      if (!candidateId) {
        Alert.alert('Brak kandydata', 'Nie znaleziono kontekstu kandydata.');
        return;
      }

      setIsSubmitting(true);

      try {
        console.log('SENDING putMobywatel');
        await putMobywatel(candidateId, buildMobywatelPayload(data));
        console.log('OK putMobywatel');
        console.log('SENDING putUserInput');
        await putUserInput(candidateId, buildUserInputPayload(data));
        console.log('OK putUserInput');
        console.log('SENDING putUrzadPracy');
        await putUrzadPracy(candidateId, buildUrzadPracyPayload(data));
        console.log('OK putUrzadPracy');
        const jobId = typeof params.jobId === 'string' ? params.jobId.trim() : '';
        const employerId = typeof params.employerId === 'string' ? params.employerId.trim() : '';

        let applyMessage = '';
        if (jobId) {
          console.log('SENDING applyToJob');
          const applyResult = await applyToJob({
            candidateId,
            jobId,
            employerId: employerId || undefined,
            selectedDocuments: [],
          });

          applyMessage =
            applyResult.message === 'Application already exists'
              ? '\n\nAplikacja na tę ofertę już istniała i została zaktualizowana.'
              : '\n\nAplikacja została zapisana i przekazana do pracodawcy.';
        }

        await loadQuestionnaire(candidateId);
        setIsSubmitting(false);
        console.log('SHOWING ALERT NOW');
        if (Platform.OS === 'web') {
          window.alert(
            '✅ Kwestionariusz zapisany! ' +
              (applyMessage ? applyMessage : 'Zaraz zostaniesz przekierowany do ofert pracy.'),
          );
          if (jobId) {
            router.push('/(tabs)/mPraca/candidate/my-applications');
          } else {
            router.push('/(tabs)/mPraca/candidate/job-search');
          }
        } else {
          Alert.alert(
            'Kwestionariusz zapisany',
            `Twoje dane zostały przesłane. Pola z mObywatela i ZUS są automatycznie zweryfikowane.${applyMessage}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (jobId) {
                    router.push('/(tabs)/mPraca/candidate/my-applications');
                  } else {
                    router.push('/(tabs)/mPraca/candidate/job-search');
                  }
                },
              },
            ],
          );
        }
      } catch (error) {
        setIsSubmitting(false);
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się zapisać kwestionariusza. Spróbuj ponownie.';
        Alert.alert('Błąd zapisu', message, [{text: 'OK'}]);
      }
    },
    [candidateId, loadQuestionnaire, params.employerId, params.jobId, router],
  );

  // ── Preferencje (toggle chip) ──
  const togglePreference = useCallback(
    (category: string, currentValues: string[]) => {
      const next = currentValues.includes(category)
        ? currentValues.filter(c => c !== category)
        : [...currentValues, category];
      setValue('preferencje', next, {shouldValidate: true, shouldDirty: true});
    },
    [setValue],
  );

  // ═════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════
  if (isInitialLoading) {
    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <View
          style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24}}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={{marginTop: 12, color: C.textSecondary, textAlign: 'center'}}>
            Ładowanie danych kandydata...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* ─── HEADER ─── */}
        <View style={s.pageHeader}>
          <View style={s.pageHeaderIconRow}>
            <View style={s.pageHeaderIconBg}>
              <Shield size={24} color={C.textOnPrimary} />
            </View>
          </View>
          <Text style={s.pageTitle}>Profil Kandydata</Text>
          <Text style={s.pageSubtitle}>
            Uzupełnij dane, by stworzyć zweryfikowany profil w systemie mPraca. Pola oznaczone
            tarczą pobierane są z rejestrów państwowych.
          </Text>
          {loadError ? (
            <View
              style={{marginTop: 12, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 10}}>
              <Text style={{color: C.danger, fontWeight: '600'}}>Błąd ładowania: {loadError}</Text>
            </View>
          ) : null}
        </View>

        {/* ═══ SEKCJA 1: DANE Z mOBYWATELA (ReadOnly) ═══ */}
        <Section
          title="Dane z mObywatel"
          subtitle="Pobrane z rejestru – nie można edytować"
          icon={Shield}
          iconColor={C.primary}
          iconBg={C.primaryLight}
          badge="Zweryfikowane"
          badgeColor={C.successLight}
          defaultOpen={true}>
          <View style={s.verifiedBanner}>
            <Shield size={14} color={C.success} />
            <Text style={s.verifiedBannerText}>Dane zweryfikowane przez system mObywatel</Text>
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

        {/* ═══ SEKCJA 2: DANE KONTAKTOWE ═══ */}
        <Section
          title="Dane kontaktowe"
          subtitle="Uzupełnij telefon i e-mail"
          icon={Phone}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
          defaultOpen={true}>
          <Controller
            control={control}
            name="nr_telefonu"
            render={({field: {onChange, onBlur, value}}) => (
              <FormField label="Numer telefonu" error={errors.nr_telefonu?.message} required>
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
            render={({field: {onChange, onBlur, value}}) => (
              <FormField label="Adres e-mail" error={errors.email?.message} required>
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

        {/* ═══ SEKCJA: DOKUMENT CV (PDF) ═══ */}
        <Section
          title="Dokument CV"
          subtitle="Prześlij PDF z twoim CV aby wyekstrahować dane"
          icon={Download}
          iconColor="#06B6D4"
          iconBg="#ECFDF5"
          defaultOpen={true}>
          <CVUpload
            onUpload={handleCVUpload}
            loading={isUploadingCV}
            disabled={Boolean(cvData)}
            onUploadStart={() => setIsUploadingCV(true)}
            onUploadError={error => {
              setCvUploadError(error);
              setIsUploadingCV(false);
            }}
          />
          {cvData ? (
            <CVExtractionPreview
              extractedData={cvData.extracted_data}
              extractionStatus={cvData.extraction_status}
              uploadedAt={cvData.uploaded_at}
              loading={isUploadingCV}
              onDelete={handleCVDelete}
              onAutoFill={handleCVAutoFill}
              autoFillApplied={isCvAutoFilled}
            />
          ) : null}
          {cvUploadError && (
            <View style={{marginTop: 12, backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10}}>
              <Text style={{color: '#DC2626', fontSize: 12, fontWeight: '500'}}>
                Błąd: {cvUploadError}
              </Text>
            </View>
          )}
        </Section>

        {/* ═══ PREFERENCJE BRANŻOWE ═══ */}
        <Section
          title="Preferencje branżowe"
          subtitle="Wybierz interesujące Cię branże"
          icon={Briefcase}
          iconColor="#C026D3"
          iconBg="#FDF4FF"
          defaultOpen={true}>
          <Controller
            control={control}
            name="preferencje"
            render={({field: {value}}) => (
              <FormField label="Branże" error={errors.preferencje?.message} required>
                <View style={s.chipsContainer}>
                  {BRANZE.map(branza => {
                    const selected = value.includes(branza);
                    return (
                      <TouchableOpacity
                        key={branza}
                        style={[s.chip, selected && s.chipSelected]}
                        onPress={() => togglePreference(branza, value)}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityState={{checked: selected}}
                        accessibilityLabel={branza}>
                        <Text style={[s.chipText, selected && s.chipTextSelected]}>{branza}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </FormField>
            )}
          />
        </Section>

        {/* ═══ OBSZAR POSZUKIWAŃ ═══ */}
        <Section
          title="Obszar poszukiwań"
          subtitle="Gdzie szukasz pracy?"
          icon={MapPin}
          iconColor="#EA580C"
          iconBg="#FFF7ED"
          defaultOpen={true}>
          <Controller
            control={control}
            name="wojewodztwo"
            render={({field: {onChange, value}}) => (
              <FormField label="Województwo" error={errors.wojewodztwo?.message} required>
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
            render={({field: {onChange, onBlur, value}}) => (
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

        {/* ═══ DOŚWIADCZENIE ZAWODOWE ═══ */}
        <Section
          title="Doświadczenie zawodowe"
          subtitle="Historia zatrudnienia"
          icon={Building}
          iconColor="#0284C7"
          iconBg="#E0F2FE"
          badge={`${doswiadczeniaArray.fields.length}`}>
          <TouchableOpacity
            style={s.fetchButton}
            onPress={handleFetchFromZUS}
            disabled={isLoadingZUS}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Pobierz historię z ZUS lub Urzędu Pracy">
            {isLoadingZUS ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Download size={16} color={C.primary} />
            )}
            <Text style={s.fetchButtonText}>
              {isLoadingZUS ? 'Zapisywanie...' : 'Zapisz doświadczenie do Urzędu Pracy'}
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
                  accessibilityLabel={`Usuń doświadczenie ${index + 1}`}>
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`doswiadczenia_zawodowe.${index}.stanowisko`}
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField
                    label="Stanowisko"
                    error={errors.doswiadczenia_zawodowe?.[index]?.stanowisko?.message}
                    required>
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
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField
                    label="Firma"
                    error={errors.doswiadczenia_zawodowe?.[index]?.firma?.message}
                    required>
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
                    render={({field: {onChange, onBlur, value}}) => (
                      <FormField
                        label="Od"
                        error={errors.doswiadczenia_zawodowe?.[index]?.od?.message}
                        required>
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
                    render={({field: {onChange, onBlur, value}}) => (
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
            onPress={() => doswiadczeniaArray.append({stanowisko: '', firma: '', od: '', do: ''})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj doświadczenie">
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj doświadczenie</Text>
          </TouchableOpacity>
        </Section>

        {/* ═══ JĘZYKI OBCE ═══ */}
        <Section
          title="Języki obce"
          subtitle="Języki i ich poziomy"
          icon={Languages}
          iconColor="#059669"
          iconBg="#ECFDF5"
          badge={`${jezykiArray.fields.length}`}>
          {jezykiArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => jezykiArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń język ${index + 1}`}>
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`jezyki.${index}.jezyk`}
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField label="Język" error={errors.jezyki?.[index]?.jezyk?.message} required>
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
                render={({field: {onChange, value}}) => (
                  <FormField
                    label="Poziom"
                    error={errors.jezyki?.[index]?.poziom?.message}
                    required>
                    <View style={s.levelChipRow}>
                      {POZIOMY_JEZYKOWE.map(lvl => (
                        <TouchableOpacity
                          key={lvl}
                          style={[s.levelChip, value === lvl && s.levelChipActive]}
                          onPress={() => onChange(lvl)}
                          activeOpacity={0.7}>
                          <Text style={[s.levelChipText, value === lvl && s.levelChipTextActive]}>
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
            onPress={() => jezykiArray.append({jezyk: '', poziom: 'B1'})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj język">
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj język</Text>
          </TouchableOpacity>
        </Section>

        {/* ═══ SZKOLENIA I KURSY ═══ */}
        <Section
          title="Szkolenia i Kursy"
          subtitle="Dodaj ukończone szkolenia"
          icon={GraduationCap}
          iconColor="#D97706"
          iconBg="#FFFBEB"
          badge={`${szkoleniaArray.fields.length}`}>
          {szkoleniaArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => szkoleniaArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń szkolenie ${index + 1}`}>
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`szkolenia.${index}.nazwa`}
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField
                    label="Nazwa szkolenia"
                    error={errors.szkolenia?.[index]?.nazwa?.message}
                    required>
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
                render={({field: {onChange, onBlur, value}}) => (
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
                render={({field: {onChange, onBlur, value}}) => (
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
            onPress={() => szkoleniaArray.append({nazwa: '', organizator: '', rok: ''})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj szkolenie">
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj szkolenie / kurs</Text>
          </TouchableOpacity>
        </Section>

        {/* ═══ CERTYFIKATY ═══ */}
        <Section
          title="Certyfikaty"
          subtitle="Posiadane certyfikaty branżowe"
          icon={Award}
          iconColor="#7C3AED"
          iconBg="#F5F3FF"
          badge={`${certyfikatyArray.fields.length}`}>
          {certyfikatyArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => certyfikatyArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń certyfikat ${index + 1}`}>
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`certyfikaty.${index}.nazwa`}
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField
                    label="Nazwa certyfikatu"
                    error={errors.certyfikaty?.[index]?.nazwa?.message}
                    required>
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
                render={({field: {onChange, onBlur, value}}) => (
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
                render={({field: {onChange, onBlur, value}}) => (
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
            onPress={() => certyfikatyArray.append({nazwa: '', wystawca: '', data_wydania: ''})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj certyfikat">
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj certyfikat</Text>
          </TouchableOpacity>
        </Section>

        {/* ═══ AKTYWNOŚĆ DODATKOWA ═══ */}
        <Section
          title="Aktywność dodatkowa"
          subtitle="Wolontariat, projekty, działalność"
          icon={Heart}
          iconColor="#DC2626"
          iconBg="#FEF2F2"
          badge={`${aktywnoscArray.fields.length}`}>
          {aktywnoscArray.fields.map((item, index) => (
            <View key={item.id} style={s.fieldArrayCard}>
              <View style={s.fieldArrayCardHeader}>
                <Text style={s.fieldArrayCardIndex}>#{index + 1}</Text>
                <TouchableOpacity
                  onPress={() => aktywnoscArray.remove(index)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Usuń aktywność ${index + 1}`}>
                  <Trash2 size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name={`aktywnosc_dodatkowa.${index}.opis`}
                render={({field: {onChange, onBlur, value}}) => (
                  <FormField
                    label="Opis aktywności"
                    error={errors.aktywnosc_dodatkowa?.[index]?.opis?.message}
                    required>
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
                render={({field: {onChange, onBlur, value}}) => (
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
                render={({field: {onChange, onBlur, value}}) => (
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
            onPress={() => aktywnoscArray.append({opis: '', organizacja: '', okres: ''})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dodaj aktywność">
            <Plus size={16} color={C.primary} />
            <Text style={s.addButtonText}>Dodaj aktywność</Text>
          </TouchableOpacity>
        </Section>

        <View style={{height: 20}} />
      </ScrollView>

      {/* ═══ FOOTER ═══ */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitButton, (isSubmitting || !candidateId) && s.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit, errors => {
            Alert.alert(
              'Błędy formularza',
              'Popraw błędy w polach:\n' + Object.keys(errors).join(', '),
            );
          })}
          disabled={isSubmitting || !candidateId}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Zapisz kwestionariusz">
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
