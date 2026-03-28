import {JobOffer} from '@/src/services/mPraca/candidate/data/MockData';
import {fetchJobs} from '@/src/services/api';
<<<<<<< HEAD
import {Briefcase, Search, SlidersHorizontal, ChevronRight, Filter, Calendar} from 'lucide-react-native';
=======
import {Briefcase, Search, SlidersHorizontal, ChevronRight, ChevronDown, Filter} from 'lucide-react-native';
>>>>>>> 3b54041c6f4113d1e1a08c8093944dfedf57e2e7
import React, {useEffect, useState, useCallback} from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import {useRouter} from 'expo-router';
import CVRequirementModal from '@/src/services/mPraca/candidate/components/CVRequirementModal';
import {validateJobCVRequirement} from '@/src/services/mPraca/candidate/api/jobRequirementsApi';
import {BRANZE, TYPY_UMOWY, WYMIAR_ETATU} from '@/src/services/mPraca/candidate/data/questionnaireSchema';

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
const WORK_MODE_OPTIONS = ['Dowolny', 'Stacjonarna', 'Hybrydowa', 'Zdalna'];

const getDaysLeftLabel = (deadline?: string | null) => {
  if (!deadline) return null;
  try {
    const msPerDay = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);

    const diffDays = Math.round((d.getTime() - today.getTime()) / msPerDay);

    if (diffDays < 0) return 'Nabór zakończony';
    if (diffDays === 0) return 'Ostatni dzień na aplikację';
    if (diffDays === 1) return 'Został 1 dzień na aplikację';
    return `Zostało ${diffDays} dni na aplikację`;
  } catch {
    return null;
  }
};

export default function JobSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('Dowolna');
  const [selectedWorkTime, setSelectedWorkTime] = useState('Dowolny');
  const [selectedWorkMode, setSelectedWorkMode] = useState('Dowolny');
  const [selectedTerm, setSelectedTerm] = useState('Dowolny');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categoryOptions = ['Wszystkie', ...BRANZE];
  const employmentTypeOptions = ['Dowolna', ...TYPY_UMOWY];
  const workTimeOptions = ['Dowolny', ...WYMIAR_ETATU];
  const termOptions = ['Dowolny', 'Do 3 dni', 'Do tygodnia'];

  useEffect(() => {
    loadJobs();
  }, [searchQuery, selectedCategory, selectedEmploymentType, selectedWorkTime, selectedWorkMode]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const results = await fetchJobs(
        searchQuery,
        selectedCategory,
        selectedEmploymentType,
        selectedWorkTime,
        selectedWorkMode,
      );
      setJobs(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
    if (filtersExpanded) {
      setOpenDropdown(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
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
            reason: validation.reason || undefined,
          });
          setCvModalVisible(true);
        } else {
          const employerId =
            (job as JobOffer & {employerId?: string; employer_id?: string}).employerId ||
            (job as JobOffer & {employerId?: string; employer_id?: string}).employer_id;
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
        Alert.alert('Błąd', 'Nie udało się zweryfikować wymagań CV. Spróbuj ponownie.', [
          {text: 'OK'},
        ]);
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
          (selectedJobForApplication as JobOffer & {employerId?: string; employer_id?: string})
            .employerId ||
          (selectedJobForApplication as JobOffer & {employerId?: string; employer_id?: string})
            .employer_id,
      },
    });
  }, [router, selectedJobForApplication]);

  const renderOfferCard = ({item}: {item: JobOffer}) => {
    const daysLeftLabel = getDaysLeftLabel(
      (item as JobOffer & {applicationDeadline?: string | null}).applicationDeadline,
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/mPraca/candidate/job-details/[id]',
            params: {id: item.id},
          })
        }
        activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <View style={styles.cardMain}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <View style={styles.companyNameRow}>
              <Briefcase size={14} color={MO_TEXT_SECONDARY} style={{marginRight: 4}} />
              <Text style={styles.companyNameText}>{item.company}</Text>
            </View>
            <View style={styles.cardFooter}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.salary}>{item.salaryRange} PLN</Text>
                {daysLeftLabel && (
                  <View style={styles.deadlinePill}>
                    <Calendar size={14} color="#C2410C" style={{marginRight: 4}} />
                    <Text style={styles.deadlinePillText}>{daysLeftLabel}</Text>
                  </View>
                )}
              </View>
              <View style={styles.detailsLink}>
                <Text style={styles.detailsText}>Zobacz szczegóły</Text>
                <ChevronRight size={18} color={MO_BLUE} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          accessibilityLabel="Filtruj wyniki">
          <SlidersHorizontal size={22} color={filtersExpanded ? MO_WHITE : MO_BLUE} />
        </TouchableOpacity>
      </View>

      {filtersExpanded && (
        <View style={styles.filtersPanel}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.filterGroupsScroll}>
            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Branża</Text>
              </View>
              {categoryOptions.length > 3 ? (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() =>
                      setOpenDropdown(prev => (prev === 'category' ? null : 'category'))
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Rozwiń filtr branży">
                    <Text style={styles.dropdownTriggerText}>{selectedCategory}</Text>
                    <ChevronDown
                      size={18}
                      color={MO_TEXT_SECONDARY}
                      style={openDropdown === 'category' ? styles.dropdownChevronOpen : undefined}
                    />
                  </TouchableOpacity>
                  {openDropdown === 'category' && (
                    <View style={styles.dropdownMenu}>
                      {categoryOptions.map(cat => (
                        <TouchableOpacity
                          key={cat}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedCategory(cat);
                            setOpenDropdown(null);
                          }}>
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedCategory === cat && styles.dropdownOptionTextActive,
                            ]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chipsRow}>
                  {categoryOptions.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                      onPress={() => setSelectedCategory(cat)}>
                      <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Rodzaj umowy</Text>
              </View>
              {employmentTypeOptions.length > 3 ? (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() =>
                      setOpenDropdown(prev => (prev === 'employment' ? null : 'employment'))
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Rozwiń filtr rodzaju umowy">
                    <Text style={styles.dropdownTriggerText}>{selectedEmploymentType}</Text>
                    <ChevronDown
                      size={18}
                      color={MO_TEXT_SECONDARY}
                      style={openDropdown === 'employment' ? styles.dropdownChevronOpen : undefined}
                    />
                  </TouchableOpacity>
                  {openDropdown === 'employment' && (
                    <View style={styles.dropdownMenu}>
                      {employmentTypeOptions.map(type => (
                        <TouchableOpacity
                          key={type}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedEmploymentType(type);
                            setOpenDropdown(null);
                          }}>
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedEmploymentType === type && styles.dropdownOptionTextActive,
                            ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chipsRow}>
                  {employmentTypeOptions.map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, selectedEmploymentType === type && styles.chipActive]}
                      onPress={() => setSelectedEmploymentType(type)}>
                      <Text
                        style={[
                          styles.chipText,
                          selectedEmploymentType === type && styles.chipTextActive,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Wymiar etatu</Text>
              </View>
              {workTimeOptions.length > 3 ? (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() =>
                      setOpenDropdown(prev => (prev === 'workTime' ? null : 'workTime'))
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Rozwiń filtr wymiaru etatu">
                    <Text style={styles.dropdownTriggerText}>{selectedWorkTime}</Text>
                    <ChevronDown
                      size={18}
                      color={MO_TEXT_SECONDARY}
                      style={openDropdown === 'workTime' ? styles.dropdownChevronOpen : undefined}
                    />
                  </TouchableOpacity>
                  {openDropdown === 'workTime' && (
                    <View style={styles.dropdownMenu}>
                      {workTimeOptions.map(time => (
                        <TouchableOpacity
                          key={time}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedWorkTime(time);
                            setOpenDropdown(null);
                          }}>
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedWorkTime === time && styles.dropdownOptionTextActive,
                            ]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chipsRow}>
                  {workTimeOptions.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.chip, selectedWorkTime === time && styles.chipActive]}
                      onPress={() => setSelectedWorkTime(time)}>
                      <Text style={[styles.chipText, selectedWorkTime === time && styles.chipTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Tryb pracy</Text>
              </View>
              {WORK_MODE_OPTIONS.length > 3 ? (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() =>
                      setOpenDropdown(prev => (prev === 'workMode' ? null : 'workMode'))
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Rozwiń filtr trybu pracy">
                    <Text style={styles.dropdownTriggerText}>{selectedWorkMode}</Text>
                    <ChevronDown
                      size={18}
                      color={MO_TEXT_SECONDARY}
                      style={openDropdown === 'workMode' ? styles.dropdownChevronOpen : undefined}
                    />
                  </TouchableOpacity>
                  {openDropdown === 'workMode' && (
                    <View style={styles.dropdownMenu}>
                      {WORK_MODE_OPTIONS.map(mode => (
                        <TouchableOpacity
                          key={mode}
                          style={styles.dropdownOption}
                          onPress={() => {
                            setSelectedWorkMode(mode);
                            setOpenDropdown(null);
                          }}>
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedWorkMode === mode && styles.dropdownOptionTextActive,
                            ]}>
                            {mode}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.chipsRow}>
                  {WORK_MODE_OPTIONS.map(mode => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.chip, selectedWorkMode === mode && styles.chipActive]}
                      onPress={() => setSelectedWorkMode(mode)}>
                      <Text style={[styles.chipText, selectedWorkMode === mode && styles.chipTextActive]}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Termin aplikowania</Text>
              </View>
              <View style={styles.chipsRow}>
                {termOptions.map(term => (
                  <TouchableOpacity
                    key={term}
                    style={[styles.chip, selectedTerm === term && styles.chipActive]}
                    onPress={() => setSelectedTerm(term)}>
                    <Text style={[styles.chipText, selectedTerm === term && styles.chipTextActive]}>
                      {term}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterGroupHeader}>
                <Filter size={14} color={MO_BLUE} style={{marginRight: 6}} />
                <Text style={styles.filterSectionTitle}>Dodatkowe</Text>
              </View>
              <View style={styles.chipsRow}>
                {['Tylko bez KRK', 'Wymaga Sanepidu', 'Prawo Jazdy'].map(tag => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => toggleTag(tag)}>
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
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
  container: {flex: 1, backgroundColor: MO_BG},

  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: MO_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: MO_BORDER,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {marginRight: 8},
  searchInput: {flex: 1, height: 48, fontSize: 16, color: MO_TEXT_PRIMARY},
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MO_WHITE,
  },
  filterButtonActive: {backgroundColor: MO_BLUE},

  filtersPanel: {
    backgroundColor: MO_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: MO_BORDER,
  },
  filterGroupsScroll: {
    maxHeight: 320,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MO_TEXT_PRIMARY,
  },
  chipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MO_BORDER,
    backgroundColor: MO_WHITE,
  },
  chipActive: {borderColor: MO_BLUE, backgroundColor: '#EFF6FF'},
  chipText: {fontSize: 14, color: MO_TEXT_SECONDARY, fontWeight: '500'},
  chipTextActive: {color: MO_BLUE, fontWeight: '600'},
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: MO_BORDER,
    borderRadius: 12,
    backgroundColor: MO_WHITE,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: MO_TEXT_PRIMARY,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dropdownChevronOpen: {
    transform: [{rotate: '180deg'}],
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: MO_BORDER,
    borderRadius: 12,
    backgroundColor: MO_WHITE,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: MO_TEXT_SECONDARY,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    color: MO_BLUE,
    fontWeight: '700',
  },

  listContent: {padding: 16, paddingBottom: 40},
  card: {
    backgroundColor: MO_WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {elevation: 2},
    }),
  },
  cardContent: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  cardMain: {flex: 1, paddingRight: 12},
  jobTitle: {fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 4},
  companyNameRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  companyNameText: {fontSize: 14, fontWeight: '500', color: MO_TEXT_SECONDARY},
  salary: {fontSize: 14, fontWeight: '700', color: '#047857'},
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: MO_BLUE,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
  },
  deadlinePillText: {
    fontSize: 12,
    color: '#C2410C',
    fontWeight: '600',
  },
});
