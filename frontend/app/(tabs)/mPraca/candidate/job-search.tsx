import { JobOffer } from '@/src/services/mPraca/candidate/data/MockData';
import { fetchJobs } from '@/src/services/api';
import { Briefcase, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import { useRouter } from 'expo-router';

import CVRequirementModal from '@/src/services/mPraca/candidate/components/CVRequirementModal';
import { validateJobCVRequirement } from '@/src/services/mPraca/candidate/api/jobRequirementsApi';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

export default function JobSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [searchQuery]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const results = await fetchJobs(searchQuery);
      setJobs(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Przykładowe filtry
  const [selectedTerm, setSelectedTerm] = useState('Dowolny');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // CV Requirement Modal state
  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [cvModalData, setCvModalData] = useState<{
    jobId: string;
    jobTitle: string;
    requiresCV: boolean;
    reason?: string;
  } | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobOffer | null>(null);
  const [checkingCvRequirement, setCheckingCvRequirement] = useState(false);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersExpanded(!filtersExpanded);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleApplyPress = useCallback(
    async (job: JobOffer) => {
      // For demo, use a mock candidate ID
      const candidateId = 'mock-candidate-123'; // In real app, get from context

      setCheckingCvRequirement(true);

      try {
        // Check if job requires CV
        const validation = await validateJobCVRequirement(job.id, candidateId);

        if (!validation.valid) {
          // Job requires CV but candidate doesn't have one
          setSelectedJobForApplication(job);
          setCvModalData({
            jobId: job.id,
            jobTitle: job.title,
            requiresCV: validation.requires_cv,
            reason: validation.reason,
          });
          setCvModalVisible(true);
        } else {
          const employerId = (job as JobOffer & { employerId?: string; employer_id?: string }).employerId
            || (job as JobOffer & { employerId?: string; employer_id?: string }).employer_id;
          router.push({
            pathname: '/(tabs)/mPraca/candidate/questionnaire',
            params: {
              jobId: job.id,
              employerId,
            },
          });
        }
      } catch (error) {
        console.error('Error checking CV requirement:', error);
        Alert.alert('Błąd', 'Nie udało się zweryfikować wymagań CV. Spróbuj ponownie.', [{ text: 'OK' }]);
      } finally {
        setCheckingCvRequirement(false);
      }
    },
    [router],
  );

  const handleUploadCVFromModal = useCallback(() => {
    setCvModalVisible(false);
    if (!selectedJobForApplication) {
      router.push('/(tabs)/mPraca/candidate/questionnaire');
      return;
    }

    router.push({
      pathname: '/(tabs)/mPraca/candidate/questionnaire',
      params: {
        jobId: selectedJobForApplication.id,
        employerId:
          (selectedJobForApplication as JobOffer & { employerId?: string; employer_id?: string }).employerId ||
          (selectedJobForApplication as JobOffer & { employerId?: string; employer_id?: string }).employer_id,
      },
    });
  }, [router, selectedJobForApplication]);

  const renderOfferCard = ({ item }: { item: JobOffer }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryBadge}>{item.category.toUpperCase()}</Text>
        <Text style={styles.salary}>{item.salaryRange}</Text>
      </View>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <View style={styles.companyNameRow}>
        <Briefcase size={14} color={MO_TEXT_SECONDARY} style={{ marginRight: 4 }} />
        <Text style={styles.companyNameText}>{item.company}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      {/* CV Requirement Badge (mockData doesn't have it yet, but will be shown when available) */}
      {/* In real implementation, would show: <Text style={styles.cvRequiredBadge}>📄 CV Required</Text> */}
      
      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => handleApplyPress(item)}
        disabled={checkingCvRequirement}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Aplikuj na ${item.title}`}
      >
        <Text style={styles.applyButtonText}>
          {checkingCvRequirement ? 'Sprawdzanie...' : 'Aplikuj jednym kliknięciem'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={MO_TEXT_SECONDARY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Wpisz stanowisko lub firmę..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, filtersExpanded && styles.filterButtonActive]} 
          onPress={toggleFilters}
          accessibilityRole="button"
          accessibilityLabel="Filtruj wyniki"
        >
          <SlidersHorizontal size={22} color={filtersExpanded ? MO_WHITE : MO_BLUE} />
        </TouchableOpacity>
      </View>

      {filtersExpanded && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterSectionTitle}>Termin aplikowania</Text>
          <View style={styles.chipsRow}>
            {['Dowolny', 'Do 3 dni', 'Do tygodnia'].map(term => (
              <TouchableOpacity 
                key={term} 
                style={[styles.chip, selectedTerm === term && styles.chipActive]}
                onPress={() => setSelectedTerm(term)}
              >
                <Text style={[styles.chipText, selectedTerm === term && styles.chipTextActive]}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterSectionTitle}>Wymagania Państwowe (Inne kategorie)</Text>
          <View style={styles.chipsRow}>
            {['Tylko bez KRK', 'Wymaga Sanepidu', 'Prawo Jazdy'].map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{tag}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        renderItem={renderOfferCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* CV Requirement Modal */}
      <CVRequirementModal
        visible={cvModalVisible}
        jobTitle={cvModalData?.jobTitle || ''}
        reason={cvModalData?.reason}
        onUploadCV={handleUploadCVFromModal}
        onCancel={() => {
          setCvModalVisible(false);
          setCvModalData(null);
          setSelectedJobForApplication(null);
        }}
        loading={checkingCvRequirement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  
  searchContainer: { flexDirection: 'row', padding: 16, backgroundColor: MO_WHITE, borderBottomWidth: 1, borderBottomColor: MO_BORDER, gap: 12 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: MO_TEXT_PRIMARY },
  filterButton: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: MO_BLUE, alignItems: 'center', justifyContent: 'center', backgroundColor: MO_WHITE },
  filterButtonActive: { backgroundColor: MO_BLUE },
  
  filtersPanel: { padding: 16, backgroundColor: MO_WHITE, borderBottomWidth: 1, borderBottomColor: MO_BORDER },
  filterSectionTitle: { fontSize: 14, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 12, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: MO_BORDER, backgroundColor: MO_WHITE },
  chipActive: { borderColor: MO_BLUE, backgroundColor: '#EFF6FF' },
  chipText: { fontSize: 14, color: MO_TEXT_SECONDARY, fontWeight: '500' },
  chipTextActive: { color: MO_BLUE, fontWeight: '600' },
  
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: MO_WHITE, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: MO_BORDER, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 }, android: { elevation: 2 } }) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: { fontSize: 12, fontWeight: '700', color: MO_BLUE, letterSpacing: 0.5 },
  salary: { fontSize: 14, fontWeight: '700', color: '#047857' },
  jobTitle: { fontSize: 20, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 6 },
  companyNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companyNameText: { fontSize: 14, fontWeight: '500', color: MO_TEXT_SECONDARY },
  description: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 20 },
  applyButton: { backgroundColor: MO_BLUE, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  applyButtonText: { color: MO_WHITE, fontSize: 15, fontWeight: '700' },
});
