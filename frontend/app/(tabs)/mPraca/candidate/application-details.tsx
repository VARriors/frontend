import {
  Building2,
  Clock,
  Eye,
  MailOpen,
  MapPin,
  Send,
} from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getCandidateApplicationDetails,
  type CandidateApplicationDetails,
} from '@/src/services/mPraca/candidate/api/questionnaireApi';

const MO_BLUE = '#0052A5';
const MO_WHITE = '#FFFFFF';
const MO_TEXT_PRIMARY = '#1F2937';
const MO_TEXT_SECONDARY = '#6B7280';
const MO_BORDER = '#E5E7EB';
const MO_BG = '#F9FAFB';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'SENT': return <Send size={16} color="#6B7280" />;
    case 'VIEWED': return <Eye size={16} color="#8B5CF6" />;
    case 'ACCEPTED': return <MailOpen size={16} color="#10B981" />;
    case 'REJECTED': return <Clock size={16} color="#EF4444" />;
    default: return <Clock size={16} color={MO_TEXT_SECONDARY} />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'SENT': return '#F3F4F6';
    case 'VIEWED': return '#EDE9FE';
    case 'ACCEPTED': return '#D1FAE5';
    case 'REJECTED': return '#FEE2E2';
    default: return '#E5E7EB';
  }
};

const toTimelineType = (status?: string): TimelineEvent['type'] => {
  if (status === 'VIEWED' || status === 'ACCEPTED' || status === 'REJECTED') {
    return status;
  }
  return 'SENT';
};

const formatDateParts = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return {
      date: 'Brak daty',
      time: '--:--',
    };
  }

  return {
    date: date.toLocaleDateString('pl-PL'),
    time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
  };
};

const getEventTitle = (status: TimelineEvent['type']) => {
  switch (status) {
    case 'VIEWED':
      return 'Aplikacja została wyświetlona';
    case 'ACCEPTED':
      return 'Kandydat zaproszony do kolejnego etapu';
    case 'REJECTED':
      return 'Aplikacja została odrzucona';
    default:
      return 'Aplikacja została wysłana';
  }
};

export default function ApplicationDetailsScreen() {
  const params = useLocalSearchParams<{ applicationId?: string }>();
  const applicationId = typeof params.applicationId === 'string' ? params.applicationId : '';

  const [application, setApplication] = useState<CandidateApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadApplication = async () => {
      if (!applicationId) {
        setError('Brak identyfikatora aplikacji.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const details = await getCandidateApplicationDetails(applicationId);
        if (!active) {
          return;
        }
        setApplication(details);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : 'Nie udało się pobrać szczegółów aplikacji.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadApplication();

    return () => {
      active = false;
    };
  }, [applicationId]);

  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    if (!application) {
      return [];
    }

    const events = application.timeline?.events || [];
    if (events.length > 0) {
      return events.map((event, index) => {
        const eventType = toTimelineType(event.statusCode);
        const parsedDate = formatDateParts(event.eventTime);
        return {
          id: event.id || `event-${index}`,
          date: parsedDate.date,
          time: parsedDate.time,
          title: event.note || getEventTitle(eventType),
          type: eventType,
        };
      });
    }

    const created = formatDateParts(application.createdAt);
    return [
      {
        id: 'base',
        date: created.date,
        time: created.time,
        title: 'Aplikacja została wysłana',
        type: 'SENT',
      },
    ];
  }, [application]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={MO_BLUE} />
          <Text style={styles.stateText}>Ładowanie szczegółów aplikacji...</Text>
        </View>
      </View>
    );
  }

  if (error || !application) {
    return (
      <View style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error || 'Nie znaleziono aplikacji.'}</Text>
        </View>
      </View>
    );
  }

  const latestStatus = toTimelineType(application.status);
  const locationText = application.job?.location || 'Lokalizacja niepodana';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.jobSummaryCard}>
          <Text style={styles.jobTitle}>{application.job?.title || 'Stanowisko nieznane'}</Text>
          <View style={styles.jobDetailRow}>
            <Building2 size={16} color={MO_TEXT_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.companyName}>{application.job?.company || 'Firma nieznana'}</Text>
          </View>
          <View style={styles.jobDetailRow}>
            <MapPin size={16} color={MO_TEXT_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailText}>{locationText}</Text>
          </View>
          <View style={styles.jobDetailRow}>
            <Clock size={16} color={MO_TEXT_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailText}>Status: {getEventTitle(latestStatus)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historia Aplikacji</Text>

        <View style={styles.timelineContainer}>
          {timelineEvents.map((event, index) => {
            const isLast = index === timelineEvents.length - 1;
            
            return (
              <View key={event.id} style={styles.timelineRow}>
                {/* Left side: Date & Time */}
                <View style={styles.timelineLeft}>
                  <Text style={styles.dateText}>{event.date}</Text>
                  <Text style={styles.timeText}>{event.time}</Text>
                </View>

                {/* Divider Line & Node */}
                <View style={styles.timelineCenter}>
                  <View style={[styles.node, { backgroundColor: getEventColor(event.type) }]}>
                    {getEventIcon(event.type)}
                  </View>
                  {!isLast && <View style={styles.line} />}
                </View>

                {/* Right side: Content */}
                <View style={styles.timelineRight}>
                  <View style={styles.eventCard}>
                    <Text
                      style={[
                        styles.eventTitle,
                        event.type === 'ACCEPTED' && styles.eventTitleSuccess,
                      ]}
                    >
                      {event.title}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MO_BG },
  
  content: { padding: 20, paddingBottom: 60 },
  
  jobSummaryCard: { backgroundColor: MO_WHITE, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: MO_BORDER, marginBottom: 32 },
  jobTitle: { fontSize: 22, fontWeight: '800', color: MO_TEXT_PRIMARY, marginBottom: 12 },
  jobDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailIcon: { marginRight: 8 },
  companyName: { fontSize: 16, fontWeight: '600', color: MO_BLUE },
  detailText: { fontSize: 16, color: MO_TEXT_SECONDARY },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: MO_TEXT_PRIMARY, marginBottom: 24, paddingLeft: 4 },
  
  timelineContainer: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 80 },
  
  timelineLeft: { width: 80, alignItems: 'flex-end', paddingRight: 16, paddingTop: 4 },
  dateText: { fontSize: 13, fontWeight: '600', color: MO_TEXT_SECONDARY, marginBottom: 2 },
  timeText: { fontSize: 12, color: '#9CA3AF' },
  
  timelineCenter: { alignItems: 'center', width: 32 },
  node: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 2, borderColor: MO_WHITE },
  line: { width: 2, flex: 1, backgroundColor: MO_BORDER, marginTop: -4, marginBottom: -4, zIndex: 1 },
  
  timelineRight: { flex: 1, paddingLeft: 16, paddingBottom: 32 },
  eventCard: { backgroundColor: MO_WHITE, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: MO_BORDER },
  eventTitle: { fontSize: 15, fontWeight: '600', color: MO_TEXT_PRIMARY, lineHeight: 22 },
  eventTitleSuccess: { color: '#047857', fontWeight: '800' },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: MO_TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
  },
});
