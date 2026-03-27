import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { mockJobOffers, mockCandidateProfile, JobOffer, RequirementId, CandidateProfile } from '../data/MockData';

// Kolory zgodne z design systemem
const MO_BLUE = '#0052A5';
const MO_GREEN_BG = '#ECFDF5'; // Light green for success badge
const MO_GREEN_TEXT = '#047857'; // Dark green for success text
const MO_ORANGE_BG = '#FFFBEB'; // Light orange/yellow for warning badge
const MO_ORANGE_TEXT = '#B45309'; // Dark orange for warning text
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#111827';
const MO_TEXT_SECONDARY = '#4B5563';
const MO_BORDER = '#E5E7EB';
const MO_BG_COLOR = '#F9FAFB';

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
      <View key={req} style={[styles.badgeContainer, styles.badgeSuccess]} accessibilityLabel={`Wymóg spełniony: ${labelText}`}>
        <Text style={styles.badgeTextSuccess} adjustsFontSizeToFit numberOfLines={1}>
          ✓ Wymóg: {labelText} spełniony
        </Text>
      </View>
    );
  } else {
    return (
      <View key={req} style={[styles.badgeContainer, styles.badgeWarning]} accessibilityLabel={`Brak wymogu: ${labelText}`}>
        <Text style={styles.badgeTextWarning} adjustsFontSizeToFit numberOfLines={1}>
          ! Wymóg: Brak wpisu - {labelText}
        </Text>
      </View>
    );
  }
};

const JobOfferCard = ({ item }: { item: JobOffer }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} accessibilityRole="button">
      <View style={styles.cardHeader}>
        <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        <Text style={styles.salaryText}>{item.salaryRange}</Text>
      </View>

      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.companyText}>{item.company}</Text>

      <Text style={styles.descriptionText} numberOfLines={3}>
        {item.description}
      </Text>

      {item.requiredBadges.length > 0 && (
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>Wymagania Państwowe:</Text>
          <View style={styles.badgesWrapper}>
            {item.requiredBadges.map((req) => renderRequirementBadge(req, mockCandidateProfile))}
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={styles.applyButton}
        accessibilityLabel={`Aplikuj na stanowisko ${item.title}`}
      >
        <Text style={styles.applyButtonText}>Aplikuj jednym kliknięciem</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function JobOffersScreen() {
  const [offers] = useState<JobOffer[]>(mockJobOffers);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <JobOfferCard item={item} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.headerTitle}>Oferty Pracy</Text>
            <Text style={styles.headerSubtitle}>
              Znaleźliśmy {offers.length} ofert dopasowanych do Twojego profilu i CV.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MO_BG_COLOR,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: MO_TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 16,
    color: MO_TEXT_SECONDARY,
    marginTop: 8,
  },
  card: {
    backgroundColor: MO_WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MO_BORDER,
    // Cienie do kart (Accessibility - uwypuklenie)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: MO_BLUE,
    letterSpacing: 0.5,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: MO_GREEN_TEXT, // Saldo lub wynagrodzenie często kojarzy się z zielenią, ale tutaj używamy jej subtelnie
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: MO_TEXT_PRIMARY,
    marginBottom: 4,
  },
  companyText: {
    fontSize: 15,
    fontWeight: '500',
    color: MO_TEXT_SECONDARY,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  requirementsSection: {
    marginTop: 4,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MO_TEXT_PRIMARY,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  badgesWrapper: {
    flexDirection: 'column',
    gap: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: MO_GREEN_BG,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeWarning: {
    backgroundColor: MO_ORANGE_BG,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeTextSuccess: {
    color: MO_GREEN_TEXT,
    fontSize: 14,
    fontWeight: '600',
  },
  badgeTextWarning: {
    color: MO_ORANGE_TEXT,
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: MO_BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: MO_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
