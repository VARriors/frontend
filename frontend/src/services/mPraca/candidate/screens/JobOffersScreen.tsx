import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated, 
  PanResponder, 
  Dimensions,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { mockJobOffers, mockCandidateProfile, JobOffer, RequirementId, CandidateProfile } from '../data/MockData';
import { History, Briefcase, Undo2, X } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const MO_BLUE = '#0052A5';
const MO_GREEN_BG = '#ECFDF5';
const MO_GREEN_TEXT = '#047857';
const MO_ORANGE_BG = '#FFFBEB';
const MO_ORANGE_TEXT = '#B45309';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#111827';
const MO_TEXT_SECONDARY = '#4B5563';
const MO_BORDER = '#E5E7EB';
const MO_BG_COLOR = '#F9FAFB';

export default function JobOffersScreen() {
  const [offers, setOffers] = useState<JobOffer[]>(mockJobOffers);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Historia swajpów: action 'right' to aplikacja, 'left' to odrzucenie
  interface HistoryItem { offer: JobOffer; action: 'right' | 'left'; originalIndex: number; }
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const position = useRef(new Animated.ValueXY()).current;

  // PanResponder logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (showHint) setShowHint(false); // Ukryj hint przy pierwszym dotyku
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const currentOffer = offers[currentIndex];
    setHistory(prev => [{ offer: currentOffer, action: direction, originalIndex: currentIndex }, ...prev]);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start();
  };

  const undoSwipe = (historyItem: HistoryItem) => {
    // Krok 1: Usuwamy z historii
    setHistory(prev => prev.filter(h => h.offer.id !== historyItem.offer.id));
    
    // Krok 2: Czysty myk: ustawiamy currentIndex na ofercie wyżej
    // Będziemy modyfikować listę ofert: wstawiamy ofertę z powrotem PRZED obecnym indeksem
    const newOffers = [...offers];
    
    // Najbezpieczniejsza technika dla UX: cofasz zawsze na WIERZCH talii.
    // Zatem przekładamy tę ofertę na pozycję currentIndex - 1 (lub zamieniamy strukturę)
    // Zróbmy tak: skoro usuwamy ją z historii, dajemy ją fizycznie na (currentIndex - 1)
    newOffers.splice(currentIndex, 0, historyItem.offer); 
    // Usunięcie poprzedniego jej wystąpienia, żeby nie było duplikatu klucza w React
    const dedupedOffers = newOffers.filter((o, index) => !(o.id === historyItem.offer.id && index !== currentIndex));
    
    setOffers(dedupedOffers);
    // Wycofujemy index do tyłu, pokazując przywróconą kartę!
    // dedupedOffers ma tę ofertę na currentIndex (ponieważ usunęliśmy stary indeks).
    // Tak de facto, jeśli zrobimy to dobrze, nowa karta leży na currentIndex.
    // Animacja wejścia karty może być natychmiastowa.
    setShowHistoryModal(false);
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderRequirementBadge = (req: RequirementId, profile: CandidateProfile) => {
    let hasRequirement = false;
    let labelText = '';

    switch (req) {
      case 'sanepid':
        hasRequirement = profile.hasSanepid;
        labelText = 'Zmiarkowanie (Sanepid)';
        break;
      case 'krk':
        hasRequirement = profile.cleanCriminalRecord;
        labelText = 'Niekaralność (KRK)';
        break;
      case 'driving_license':
        hasRequirement = profile.hasDrivingLicense;
        labelText = 'Prawo Jazdy';
        break;
    }

    if (hasRequirement) {
      return (
        <View key={req} style={[styles.badgeContainer, styles.badgeSuccess]}>
          <Text style={styles.badgeTextSuccess} numberOfLines={1}>✓ {labelText}</Text>
        </View>
      );
    } else {
      return (
        <View key={req} style={[styles.badgeContainer, styles.badgeWarning]}>
          <Text style={styles.badgeTextWarning} numberOfLines={1}>! Brak: {labelText}</Text>
        </View>
      );
    }
  };

  const renderCards = () => {
    if (currentIndex >= offers.length) {
      return (
        <View style={styles.noMoreCards}>
          <Text style={styles.noMoreTitle}>To już wszystko na dziś!</Text>
          <Text style={styles.noMoreSub}>Dopasowaliśmy 100% twojego profilu.</Text>
        </View>
      );
    }

    return offers.map((item, i) => {
      if (i < currentIndex) return null;

      if (i === currentIndex) {
        return (
          <Animated.View
            key={item.id}
            style={[getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.categoryText, { flexShrink: 1 }]} numberOfLines={2}>
                {item.category.toUpperCase()}
              </Text>
              <Text style={styles.salaryText}>{item.salaryRange}</Text>
            </View>

            <Text style={styles.titleText}>{item.title}</Text>
            
            <View style={styles.companyRow}>
              <Briefcase size={16} color={MO_TEXT_SECONDARY} style={{ marginRight: 6 }} />
              <Text style={styles.companyText}>{item.company}</Text>
            </View>

            <Text style={styles.descriptionText} numberOfLines={7}>
              {item.description}
            </Text>

            <View style={{ flex: 1 }} />

            {item.requiredBadges.length > 0 && (
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Wymagania Państwowe:</Text>
                <View style={styles.badgesWrapper}>
                  {item.requiredBadges.map((req) => renderRequirementBadge(req, mockCandidateProfile))}
                </View>
              </View>
            )}

            {showHint && (
              <View style={styles.hintOverlay} pointerEvents="none">
                <Text style={styles.hintText}>⬅️ Odrzuć   |   Aplikuj ➡️</Text>
              </View>
            )}

            <Animated.View style={[styles.swipeLabelWrapper, styles.likeLabel, { opacity: position.x.interpolate({ inputRange: [0, 50], outputRange: [0, 1] }) }]}>
              <Text style={styles.swipeLabelTextLike}>APLIKUJ</Text>
            </Animated.View>
            <Animated.View style={[styles.swipeLabelWrapper, styles.nopeLabel, { opacity: position.x.interpolate({ inputRange: [-50, 0], outputRange: [1, 0] }) }]}>
              <Text style={styles.swipeLabelTextNope}>ODRZUĆ</Text>
            </Animated.View>
          </Animated.View>
        );
      }

      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyle, { zIndex: -i, top: 12 * (i - currentIndex), transform: [{ scale: 1 - 0.04 * (i - currentIndex) }] }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.categoryText, { flexShrink: 1 }]} numberOfLines={2}>
              {item.category.toUpperCase()}
            </Text>
            <Text style={styles.salaryText}>{item.salaryRange}</Text>
          </View>
          <Text style={styles.titleText}>{item.title}</Text>
          <View style={styles.companyRow}>
            <Briefcase size={16} color={MO_TEXT_SECONDARY} style={{ marginRight: 6 }} />
            <Text style={styles.companyText}>{item.company}</Text>
          </View>
          <Text style={styles.descriptionText} numberOfLines={7}>{item.description}</Text>
        </Animated.View>
      );
    }).reverse();
  };

  const [historyFilter, setHistoryFilter] = useState<'all' | 'right' | 'left'>('all');

  const filteredHistory = history.filter(h => historyFilter === 'all' || h.action === historyFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <View />
        <TouchableOpacity 
          style={styles.historyButton} 
          onPress={() => setShowHistoryModal(true)}
        >
          <History size={20} color={MO_BLUE} />
          <Text style={styles.historyBtnText}>Historia Aplikacji</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deckContainer}>
        {renderCards()}
      </View>

      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Twoje Decyzje</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={{ padding: 4 }}>
                <X size={28} color={MO_TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterBtn, historyFilter === 'all' && styles.filterBtnActive]} 
                onPress={() => setHistoryFilter('all')}
              >
                <Text style={[styles.filterBtnText, historyFilter === 'all' && styles.filterBtnTextActive]}>Wszystkie</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterBtn, historyFilter === 'right' && styles.filterBtnActive]} 
                onPress={() => setHistoryFilter('right')}
              >
                <Text style={[styles.filterBtnText, historyFilter === 'right' && styles.filterBtnTextActive]}>Zaaplikowane (✅)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterBtn, historyFilter === 'left' && styles.filterBtnActive]} 
                onPress={() => setHistoryFilter('left')}
              >
                <Text style={[styles.filterBtnText, historyFilter === 'left' && styles.filterBtnTextActive]}>Odrzucone (❌)</Text>
              </TouchableOpacity>
            </View>

            {filteredHistory.length === 0 ? (
              <Text style={styles.emptyHistoryText}>Brak wyników w tej kategorii.</Text>
            ) : (
              <FlatList
                data={filteredHistory}
                keyExtractor={(item, idx) => item.offer.id + idx}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyActionText}>
                        {item.action === 'right' ? '✅ Zaaplikowano na:' : '❌ Odrzucono:'}
                      </Text>
                      <Text style={styles.historyJobTitle}>{item.offer.title}</Text>
                      <Text style={styles.historyCompany}>{item.offer.company}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.undoBtn}
                      onPress={() => undoSwipe(item)}
                    >
                      <Undo2 size={20} color={MO_WHITE} />
                      <Text style={styles.undoText}>Cofnij</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG_COLOR },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 100 // musi byc nad kartami by dało się kliknąć
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    elevation: 2,
    shadowColor: '#0052A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyBtnText: {
    color: MO_BLUE,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6
  },
  deckContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 30, // Miejsce na bottom tab
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.9,
  },
  cardStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%', 
    backgroundColor: MO_WHITE,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: MO_BORDER,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 8 }
    })
  },

  // CARD TEXTS
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  categoryText: { fontSize: 13, fontWeight: '800', color: MO_BLUE, letterSpacing: 0.5 },
  salaryText: { fontSize: 16, fontWeight: '700', color: MO_GREEN_TEXT, textAlign: 'right' },
  titleText: { fontSize: 26, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  companyText: { fontSize: 16, fontWeight: '600', color: MO_TEXT_SECONDARY },
  descriptionText: { fontSize: 15, color: '#4B5563', lineHeight: 24 },

  // HINT
  hintOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1
  },

  // REQUIREMENTS
  requirementsSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 'auto' },
  requirementsTitle: { fontSize: 12, fontWeight: '700', color: MO_TEXT_PRIMARY, textTransform: 'uppercase', marginBottom: 8 },
  badgesWrapper: { flexWrap: 'wrap', gap: 8, flexDirection: 'row' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  badgeSuccess: { backgroundColor: MO_GREEN_BG, borderColor: '#A7F3D0' },
  badgeWarning: { backgroundColor: MO_ORANGE_BG, borderColor: '#FDE68A' },
  badgeTextSuccess: { color: MO_GREEN_TEXT, fontSize: 12, fontWeight: '600' },
  badgeTextWarning: { color: MO_ORANGE_TEXT, fontSize: 12, fontWeight: '500' },

  // SWIPE LABELS
  swipeLabelWrapper: { position: 'absolute', top: 40, padding: 8, borderRadius: 8, borderWidth: 4 },
  likeLabel: { left: 20, borderColor: '#10B981', transform: [{ rotate: '-15deg' }] },
  nopeLabel: { right: 20, borderColor: '#EF4444', transform: [{ rotate: '15deg' }] },
  swipeLabelTextLike: { color: '#10B981', fontSize: 36, fontWeight: '900', letterSpacing: 2 },
  swipeLabelTextNope: { color: '#EF4444', fontSize: 36, fontWeight: '900', letterSpacing: 2 },

  noMoreCards: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  noMoreTitle: { fontSize: 20, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 8 },
  noMoreSub: { fontSize: 16, color: MO_TEXT_SECONDARY, textAlign: 'center' },

  // MODAL
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: MO_WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.7,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: MO_BORDER, paddingBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: MO_TEXT_PRIMARY },
  emptyHistoryText: { fontSize: 16, color: MO_TEXT_SECONDARY, textAlign: 'center', marginTop: 40 },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MO_BORDER
  },
  historyInfo: { flex: 1, paddingRight: 10 },
  historyActionText: { fontSize: 13, fontWeight: '700', color: MO_TEXT_SECONDARY, marginBottom: 4 },
  historyJobTitle: { fontSize: 16, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 2 },
  historyCompany: { fontSize: 14, color: MO_TEXT_SECONDARY },
  undoBtn: {
    backgroundColor: MO_TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  undoText: { color: MO_WHITE, fontWeight: '700', marginLeft: 6 },
  
  // FILTER ROW
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: MO_BORDER,
  },
  filterBtnActive: {
    backgroundColor: MO_BLUE,
    borderColor: MO_BLUE,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: MO_TEXT_SECONDARY,
  },
  filterBtnTextActive: {
    color: MO_WHITE,
  }
});
