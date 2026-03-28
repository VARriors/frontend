import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { API_BASE_URL, fetchEmployerByNip } from '@/src/services/api';
import { getStoredEmployerCompany, getStoredEmployerNip, resolveEmployerIdForApp, saveEmployerSession } from '@/src/services/mPraca/employer/data/EmployerSession';
import { router } from 'expo-router';
import { CheckCircle, X } from 'lucide-react-native';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#D1D5DB';
const MO_BG = '#F9FAFB';

type PositionLevel = 'Stażysta' | 'Junior' | 'Mid' | 'Senior' | 'Manager';
type WorkMode = 'Stacjonarna' | 'Hybrydowa' | 'Zdalna';
type ContractType = 'Umowa o pracę' | 'Umowa zlecenie' | 'B2B' | 'Inne';
type WorkTime = 'Pełny etat' | '¾ etatu' | '½ etatu' | 'Inne';
type EducationLevel = 'Podstawowe' | 'Średnie' | 'Zawodowe' | 'Wyższe';

interface RegulatoryRequirement {
  id: string;
  name: string;
  description: string;
}

const POSITION_LEVELS: PositionLevel[] = ['Stażysta', 'Junior', 'Mid', 'Senior', 'Manager'];
const WORK_MODES: WorkMode[] = ['Stacjonarna', 'Hybrydowa', 'Zdalna'];
const CONTRACT_TYPES: ContractType[] = ['Umowa o pracę', 'Umowa zlecenie', 'B2B', 'Inne'];
const WORK_TIME_OPTIONS: WorkTime[] = ['Pełny etat', '¾ etatu', '½ etatu', 'Inne'];

const LANGUAGE_OPTIONS: string[] = ['angielski', 'niemiecki', 'ukraiński', 'rosyjski'];
const EDUCATION_LEVELS: EducationLevel[] = ['Podstawowe', 'Średnie', 'Zawodowe', 'Wyższe'];

type FormErrors = {
  title?: string;
  workMode?: string;
  companyLocation?: string;
  contractType?: string;
  workTime?: string;
  salary?: string;
};

export default function CreateJobOfferScreen() {
  const [title, setTitle] = useState('');
  const [positionLevel, setPositionLevel] = useState<PositionLevel>('Junior');

  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const [companyLocation] = useState('Siedziba firmy na podstawie NIP');
  const [useDifferentLocation, setUseDifferentLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  const [contractType, setContractType] = useState<ContractType | null>(null);
  const [workTime, setWorkTime] = useState<WorkTime | null>(null);
  const [salary, setSalary] = useState('');
  const [employerNIP, setEmployerNIP] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  const [minExperience, setMinExperience] = useState('');
  const [minEducationLevel, setMinEducationLevel] = useState<EducationLevel | null>(null);
  const [minEducationDetails, setMinEducationDetails] = useState('');

  const [languages, setLanguages] = useState<string[]>([]);
  const [extraLanguages, setExtraLanguages] = useState<string[]>([]);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [expectations, setExpectations] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [regRequirements, setRegRequirements] = useState<RegulatoryRequirement[]>([]);
  const [newRegName, setNewRegName] = useState('');
  const [newRegDescription, setNewRegDescription] = useState('');

  const [sendToJobOffice, setSendToJobOffice] = useState(false);
  const [jobOfficeProgram, setJobOfficeProgram] = useState('');
  const [jobOfficeFunding, setJobOfficeFunding] = useState('');
  const [jobOfficeNotes, setJobOfficeNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const storedCompany = getStoredEmployerCompany();
    const storedNip = getStoredEmployerNip();

    if (storedCompany) {
      setCompanyName(storedCompany);
    }
    if (storedNip) {
      setEmployerNIP(storedNip);
    }
  }, []);

  const handleToggleLanguage = (language: string) => {
    setLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    );
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddLanguage = () => {
    const trimmed = newLanguageName.trim();
    if (!trimmed) return;
    if (extraLanguages.includes(trimmed) || LANGUAGE_OPTIONS.includes(trimmed)) return;
    setExtraLanguages((prev) => [...prev, trimmed]);
    setNewLanguageName('');
  };

  const handleAddTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (customTags.includes(trimmed)) return;
    setCustomTags((prev) => [...prev, trimmed]);
    setNewTagName('');
  };

  const handleAddResponsibility = () => {
    const trimmed = newResponsibility.trim();
    if (!trimmed) return;
    if (responsibilities.includes(trimmed)) return;
    setResponsibilities((prev) => [...prev, trimmed]);
    setNewResponsibility('');
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;
    if (benefits.includes(trimmed)) return;
    setBenefits((prev) => [...prev, trimmed]);
    setNewBenefit('');
  };

  const handleRemoveResponsibility = (item: string) => {
    setResponsibilities((prev) => prev.filter((i) => i !== item));
  };

  const handleRemoveBenefit = (item: string) => {
    setBenefits((prev) => prev.filter((i) => i !== item));
  };

  const handleAddRequirement = () => {
    const nameTrimmed = newRegName.trim();
    const descTrimmed = newRegDescription.trim();
    if (!nameTrimmed || !descTrimmed) return;
    const newReq: RegulatoryRequirement = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: nameTrimmed,
      description: descTrimmed,
    };
    setRegRequirements((prev) => [...prev, newReq]);
    setNewRegName('');
    setNewRegDescription('');
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'Stanowisko jest wymagane.';
    }
    if (!workMode) {
      nextErrors.workMode = 'Wybierz tryb pracy.';
    }
    if (!companyLocation.trim()) {
      nextErrors.companyLocation = 'Brak lokalizacji firmy.';
    }
    if (!contractType) {
      nextErrors.contractType = 'Wybierz rodzaj umowy.';
    }
    if (!workTime) {
      nextErrors.workTime = 'Wybierz wymiar etatu.';
    }
    if (!salary.trim()) {
      nextErrors.salary = 'Podaj wynagrodzenie lub widełki.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validate();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const employerNipTrimmed = employerNIP.trim();
      const companyNameTrimmed = companyName.trim();

      let employerId = resolveEmployerIdForApp(true);
      if (employerNipTrimmed) {
        const employerFromNip = await fetchEmployerByNip(employerNipTrimmed);
        if (employerFromNip?._id) {
          employerId = employerFromNip._id;
          saveEmployerSession({
            employerId,
            nip: employerNipTrimmed,
            company: employerFromNip.name || employerFromNip.company || companyNameTrimmed,
          });
        }
      } else {
        saveEmployerSession({
          employerId,
          company: companyNameTrimmed,
        });
      }

      const response = await fetch(`${API_BASE_URL}/employers/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employer_id: employerId,
          title,
          company: companyNameTrimmed || 'VARriors',
          location: useDifferentLocation ? customLocation : companyLocation,
          category: '',
          description: expectations,
          salary_range: salary,
          employment_type: contractType,
          work_time: workTime,
          work_mode: workMode,
          position_level: positionLevel,
          min_experience: minExperience,
          min_education: minEducationLevel,
          min_education_details: minEducationDetails,
          languages: [...languages, ...extraLanguages],
          tags: [...selectedTags, ...customTags],
          expectations: expectations,
          responsibilities: responsibilities,
          benefits: benefits,
          application_deadline: applicationDeadline
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await response.json();
      setIsSuccess(true);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Failed to create job offer:', error);
      if (Platform.OS === 'web') {
        window.alert("Błąd: Nie udało się zapisać oferty. Sprawdź połączenie.");
      } else {
        Alert.alert("Błąd", "Nie udało się zapisać oferty. Sprawdź połączenie.");
      }
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <CheckCircle size={64} color="#10B981" />
          <Text style={styles.successTitle}>Sukces!</Text>
          <Text style={styles.successMessage}>Oferta pracy została pomyślnie dodana.</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.pageTitle}>Nowa Oferta mPraca</Text>

          {/* 0. Dane Pracodawcy */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Dane Pracodawcy</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NIP Firmy</Text>
              <TextInput
                style={styles.input}
                placeholder="np. 1234567890"
                placeholderTextColor="#9CA3AF"
                value={employerNIP}
                onChangeText={setEmployerNIP}
                keyboardType="numeric"
                accessibilityLabel="Pole edycji NIP firmy"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nazwa Firmy</Text>
              <TextInput
                style={styles.input}
                placeholder="np. Restauracja Smak"
                placeholderTextColor="#9CA3AF"
                value={companyName}
                onChangeText={setCompanyName}
                accessibilityLabel="Pole edycji nazwy firmy"
              />
            </View>
          </View>

          {/* 1. Stanowisko */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Stanowisko</Text>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Stanowisko</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="np. Kucharz, Sprzedawca, Programista"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                accessibilityLabel="Pole edycji nazwy stanowiska"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <Text style={styles.label}>Poziom stanowiska</Text>
            <View style={styles.segmentedControl}>
              {POSITION_LEVELS.map((level) => {
                const isActive = positionLevel === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentActive,
                    ]}
                    onPress={() => setPositionLevel(level)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Organizacja pracy */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Organizacja pracy</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Tryb pracy</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <View style={[styles.segmentedControl, errors.workMode && styles.segmentedControlError]}>
              {WORK_MODES.map((mode) => {
                const isActive = workMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentActive,
                    ]}
                    onPress={() => {
                      setWorkMode(mode);
                      if (errors.workMode) {
                        setErrors((prev) => ({ ...prev, workMode: undefined }));
                      }
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              </View>
              {errors.workMode && <Text style={styles.errorText}>{errors.workMode}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Lokalizacja (pobierana z NIP)</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <TextInput
                style={[styles.input, styles.disabledInput, errors.companyLocation && styles.inputError]}
                value={companyLocation}
                editable={false}
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Lokalizacja siedziby firmy na podstawie NIP"
              />
              <Text style={styles.helperText}>
                Dane adresowe pobieramy automatycznie po NIP firmy.
              </Text>
              {errors.companyLocation && <Text style={styles.errorText}>{errors.companyLocation}</Text>}
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setUseDifferentLocation((prev) => !prev)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: useDifferentLocation }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  useDifferentLocation && styles.checkboxBoxChecked,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>
                  Inna lokalizacja niż siedziba firmy
                </Text>
                <Text style={styles.helperText}>
                  Np. inny lokal, kuchnia produkcyjna lub oddział.
                </Text>
              </View>
            </TouchableOpacity>

            {useDifferentLocation && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Podaj miejsce wykonywania pracy</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Miasto, ulica, numer lokalu"
                  placeholderTextColor="#9CA3AF"
                  value={customLocation}
                  onChangeText={setCustomLocation}
                  accessibilityLabel="Pole edycji alternatywnej lokalizacji"
                />
              </View>
            )}
          </View>

          {/* 3. Warunki zatrudnienia */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}> Warunki zatrudnienia</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Rodzaj umowy</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <View style={[styles.segmentedControl, errors.contractType && styles.segmentedControlError]}>
              {CONTRACT_TYPES.map((type) => {
                const isActive = contractType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentActive,
                    ]}
                    onPress={() => {
                      setContractType(type);
                      if (errors.contractType) {
                        setErrors((prev) => ({ ...prev, contractType: undefined }));
                      }
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              </View>
              {errors.contractType && <Text style={styles.errorText}>{errors.contractType}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Wymiar etatu</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <View style={[styles.segmentedControl, errors.workTime && styles.segmentedControlError]}>
              {WORK_TIME_OPTIONS.map((option) => {
                const isActive = workTime === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.segmentButton,
                      isActive && styles.segmentActive,
                    ]}
                    onPress={() => {
                      setWorkTime(option);
                      if (errors.workTime) {
                        setErrors((prev) => ({ ...prev, workTime: undefined }));
                      }
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              </View>
              {errors.workTime && <Text style={styles.errorText}>{errors.workTime}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Wynagrodzenie (PLN)</Text>
                <Text style={styles.requiredMark}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.salary && styles.inputError]}
                placeholder="np. 5000 - 7000 brutto"
                placeholderTextColor="#9CA3AF"
                value={salary}
                onChangeText={(text) => {
                  setSalary(text);
                  if (errors.salary) {
                    setErrors((prev) => ({ ...prev, salary: undefined }));
                  }
                }}
                accessibilityLabel="Pole edycji wynagrodzenia"
              />
              {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
            </View>
          </View>

          {/* 4. Wymagane doświadczenie i wykształcenie */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Wymagania wstępne</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Minimalne doświadczenie w zawodzie</Text>
              <TextInput
                style={styles.input}
                placeholder="np. minimum 2 lata na podobnym stanowisku"
                placeholderTextColor="#9CA3AF"
                value={minExperience}
                onChangeText={setMinExperience}
                accessibilityLabel="Pole edycji minimalnego doświadczenia"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Minimalne wykształcenie</Text>
              <View style={styles.segmentedControl}>
                {EDUCATION_LEVELS.map((level) => {
                  const isActive = minEducationLevel === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.segmentButton,
                        isActive && styles.segmentActive,
                      ]}
                      onPress={() => setMinEducationLevel(level)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          isActive && styles.segmentTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {(minEducationLevel === 'Zawodowe' || minEducationLevel === 'Wyższe') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Szczegóły wykształcenia</Text>
                <TextInput
                  style={styles.input}
                  placeholder="np. kierunek, profil szkoły, specjalizacja"
                  placeholderTextColor="#9CA3AF"
                  value={minEducationDetails}
                  onChangeText={setMinEducationDetails}
                  accessibilityLabel="Pole edycji szczegółów wykształcenia"
                />
              </View>
            )}
          </View>

          {/* 10. Uprawnienia i certyfikaty państwowe (AI Match) */}
          <View style={styles.prioritiesSection}>
            <Text style={styles.sectionTitle}>Uprawnienia i certyfikaty państwowe (AI Match)</Text>
            <Text style={styles.sectionSubtitle}>
              Dodaj konkretne uprawnienia lub certyfikaty, które są wymagane (np. SEP, UDT, licencje zawodowe).
            </Text>

            {regRequirements.map((req) => (
              <View key={req.id} style={styles.requirementItem}>
                <Text style={styles.requirementTitle}>{req.name}</Text>
                <Text style={styles.requirementDescription}>{req.description}</Text>
              </View>
            ))}

            <View style={styles.sectionCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nazwa uprawnienia</Text>
                <TextInput
                  style={styles.input}
                  placeholder="np. Uprawnienia SEP do 1kV"
                  placeholderTextColor="#9CA3AF"
                  value={newRegName}
                  onChangeText={setNewRegName}
                  accessibilityLabel="Pole edycji nazwy uprawnienia"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Opis / zakres</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Krótko opisz, czego dotyczy to uprawnienie"
                  placeholderTextColor="#9CA3AF"
                  value={newRegDescription}
                  onChangeText={setNewRegDescription}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Pole edycji opisu uprawnienia"
                />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddRequirement}
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>+ Dodaj uprawnienie</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Języki obce */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>11. Języki obce</Text>
            <Text style={styles.sectionSubtitle}>Zaznacz, w jakich językach kandydat powinien się komunikować.</Text>
            <View style={styles.chipRow}>
              {[...LANGUAGE_OPTIONS, ...extraLanguages].map((lang) => {
                const isActive = languages.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                    ]}
                    onPress={() => handleToggleLanguage(lang)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.addRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Dodaj inny język</Text>
                <TextInput
                  style={styles.input}
                  placeholder="np. hiszpański"
                  placeholderTextColor="#9CA3AF"
                  value={newLanguageName}
                  onChangeText={setNewLanguageName}
                  accessibilityLabel="Pole edycji nazwy dodatkowego języka"
                />
              </View>
              <TouchableOpacity
                style={styles.addIconButton}
                onPress={handleAddLanguage}
                accessibilityRole="button"
              >
                <Text style={styles.addIconText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Twoje oczekiwania */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>12. Twoje oczekiwania</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Czego oczekujesz od kandydata?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Napisz w prostych słowach, czego oczekujesz (np. dyspozycyjność w weekendy, dokładność, punktualność)."
                placeholderTextColor="#9CA3AF"
                value={expectations}
                onChangeText={setExpectations}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Pole edycji Twoich oczekiwań"
              />
            </View>
          </View>

          {/* Tagi charakteru pracy */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>13. Tagi – charakter pracy</Text>
            <Text style={styles.sectionSubtitle}>
              Dodaj własne tagi opisujące charakter pracy (np. praca fizyczna, MS Office, obsługa klienta).
            </Text>
            <View style={styles.chipRow}>
              {customTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                    ]}
                    onPress={() => handleToggleTag(tag)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isActive }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.addRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Dodaj tag</Text>
                <TextInput
                  style={styles.input}
                  placeholder="np. Praca na zewnątrz, Praca z kasą"
                  placeholderTextColor="#9CA3AF"
                  value={newTagName}
                  onChangeText={setNewTagName}
                  accessibilityLabel="Pole edycji nazwy tagu"
                />
              </View>
              <TouchableOpacity
                style={styles.addIconButton}
                onPress={handleAddTag}
                accessibilityRole="button"
              >
                <Text style={styles.addIconText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 14. Obowiązki i Benefity */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>14. Obowiązki i Benefity</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Główne obowiązki</Text>
              <View style={styles.chipContainer}>
                {responsibilities.map((item) => (
                  <View key={item} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{item}</Text>
                    <TouchableOpacity onPress={() => handleRemoveResponsibility(item)} style={{ marginLeft: 6 }}>
                      <X size={14} color={MO_BLUE} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addInputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="np. obsługa klienta, przygotowywanie potraw"
                  placeholderTextColor="#9CA3AF"
                  value={newResponsibility}
                  onChangeText={setNewResponsibility}
                  accessibilityLabel="Pole edycji nowego obowiązku"
                />
                <TouchableOpacity
                  style={styles.addIconButton}
                  onPress={handleAddResponsibility}
                  accessibilityLabel="Przycisk dodaj obowiązek"
                >
                  <Text style={styles.addIconText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Oferowane benefity</Text>
              <View style={styles.chipContainer}>
                {benefits.map((item) => (
                  <View key={item} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{item}</Text>
                    <TouchableOpacity onPress={() => handleRemoveBenefit(item)} style={{ marginLeft: 6 }}>
                      <X size={14} color={MO_BLUE} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addInputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="np. karta sportowa, opieka medyczna"
                  placeholderTextColor="#9CA3AF"
                  value={newBenefit}
                  onChangeText={setNewBenefit}
                  accessibilityLabel="Pole edycji nowego benefitu"
                />
                <TouchableOpacity
                  style={styles.addIconButton}
                  onPress={handleAddBenefit}
                  accessibilityLabel="Przycisk dodaj benefit"
                >
                  <Text style={styles.addIconText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 15. Termin składania aplikacji */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>15. Termin składania aplikacji</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data ważności ogłoszenia</Text>
              <TextInput
                style={styles.input}
                placeholder="RRRR-MM-DD (np. 2024-12-31)"
                placeholderTextColor="#9CA3AF"
                value={applicationDeadline}
                onChangeText={setApplicationDeadline}
                accessibilityLabel="Pole edycji terminu składania aplikacji"
              />
            </View>
          </View>

          {/* Programy wsparcia Urzędu Pracy */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>16. Programy wsparcia Urzędu Pracy</Text>
            <Text style={styles.sectionSubtitle}>
              Jeśli chcesz, możemy pomóc przygotować ofertę pod programy dofinansowania z Urzędu Pracy.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setSendToJobOffice((prev) => !prev)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: sendToJobOffice }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  sendToJobOffice && styles.checkboxBoxChecked,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkboxLabel}>
                  Chcę zgłosić ofertę do Urzędu Pracy
                </Text>
                <Text style={styles.helperText}>
                  Dane z tego pola posłużą do przygotowania wniosku o dofinansowanie.
                </Text>
              </View>
            </TouchableOpacity>

            {sendToJobOffice && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rodzaj programu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="np. staż, prace interwencyjne, refundacja wynagrodzenia"
                    placeholderTextColor="#9CA3AF"
                    value={jobOfficeProgram}
                    onChangeText={setJobOfficeProgram}
                    accessibilityLabel="Pole edycji rodzaju programu Urzędu Pracy"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Oczekiwane dofinansowanie</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="np. 50% wynagrodzenia przez 6 miesięcy"
                    placeholderTextColor="#9CA3AF"
                    value={jobOfficeFunding}
                    onChangeText={setJobOfficeFunding}
                    accessibilityLabel="Pole edycji oczekiwanego dofinansowania"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dodatkowe informacje dla doradcy</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Np. możliwość zatrudnienia po zakończeniu programu, preferowana data rozpoczęcia."
                    placeholderTextColor="#9CA3AF"
                    value={jobOfficeNotes}
                    onChangeText={setJobOfficeNotes}
                    multiline
                    textAlignVertical="top"
                    accessibilityLabel="Pole edycji dodatkowych informacji dla Urzędu Pracy"
                  />
                </View>
              </>
            )}
          </View>

        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Opublikuj ofertę pracy"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={MO_WHITE} />
            ) : (
              <Text style={styles.saveButtonText}>Opublikuj za pomocą Profilu Firmy</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_WHITE },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 24 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  requiredMark: { marginLeft: 4, color: '#DC2626', fontSize: 14, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: MO_BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MO_TEXT_PRIMARY,
    backgroundColor: MO_BG,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#DC2626',
  },
  sectionCard: {
    backgroundColor: MO_WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: MO_BORDER,
    backgroundColor: MO_BG,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: MO_BLUE,
  },
  chipText: {
    fontSize: 13,
    color: MO_TEXT_SECONDARY,
  },
  chipTextActive: {
    color: MO_BLUE,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: '#EFF6FF',
  },
  helperText: {
    fontSize: 12,
    color: MO_TEXT_SECONDARY,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MO_BORDER,
    backgroundColor: MO_WHITE,
    marginRight: 12,
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: MO_BLUE,
    borderColor: MO_BLUE,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MO_TEXT_PRIMARY,
    marginBottom: 2,
  },

  prioritiesSection: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: MO_TEXT_SECONDARY, lineHeight: 18, marginBottom: 20 },

  priorityRow: { marginBottom: 24 },
  priorityLabel: { fontSize: 15, fontWeight: '600', color: MO_TEXT_PRIMARY, marginBottom: 12 },
  requirementItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: MO_BG,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MO_TEXT_PRIMARY,
    marginBottom: 4,
  },
  requirementDescription: {
    fontSize: 13,
    color: MO_TEXT_SECONDARY,
  },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  segmentedControlError: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: MO_WHITE,
    borderColor: MO_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: MO_TEXT_SECONDARY,
  },
  segmentTextActive: {
    color: MO_TEXT_PRIMARY,
    fontWeight: '700',
  },

  addButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: MO_BLUE,
    alignItems: 'center',
  },
  addButtonText: {
    color: MO_WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tagChipText: {
    fontSize: 14,
    color: MO_BLUE,
    fontWeight: '500',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addIconButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MO_BLUE,
  },
  addIconText: {
    color: MO_WHITE,
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },

  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: MO_WHITE,
  },
  saveButton: {
    backgroundColor: MO_BLUE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: MO_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: { color: MO_WHITE, fontSize: 16, fontWeight: '700' },

  successOverlay: {
    flex: 1,
    backgroundColor: MO_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: MO_WHITE,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: MO_TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});
