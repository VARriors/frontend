import { Building2, CheckCircle2, Clock, Eye, MailOpen, MapPin, Send } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  type: 'SENT' | 'DOWNLOADED' | 'VIEWED' | 'INVITED' | 'REJECTED';
}

const mockTimeline: TimelineEvent[] = [
  { id: '1', date: '12.05.2024', time: '10:00', title: 'Aplikacja została wysłana', type: 'SENT' },
  { id: '2', date: '13.05.2024', time: '14:30', title: 'Pracodawca pobrał dane o niekaralności z mObywatel', type: 'DOWNLOADED' },
  { id: '3', date: '14.05.2024', time: '09:15', title: 'Aplikacja została wyświetlona', type: 'VIEWED' },
  { id: '4', date: '15.05.2024', time: '12:00', title: 'ZAPROSZENIE NA ROZMOWĘ', type: 'INVITED' },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'SENT': return <Send size={16} color="#6B7280" />;
    case 'DOWNLOADED': return <CheckCircle2 size={16} color="#0284C7" />;
    case 'VIEWED': return <Eye size={16} color="#8B5CF6" />;
    case 'INVITED': return <MailOpen size={16} color="#10B981" />;
    case 'REJECTED': return <Clock size={16} color="#EF4444" />;
    default: return <Clock size={16} color={MO_TEXT_SECONDARY} />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'SENT': return '#F3F4F6';
    case 'DOWNLOADED': return '#E0F2FE';
    case 'VIEWED': return '#EDE9FE';
    case 'INVITED': return '#D1FAE5';
    case 'REJECTED': return '#FEE2E2';
    default: return '#E5E7EB';
  }
};

export default function ApplicationDetailsScreen() {

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.jobSummaryCard}>
          <Text style={styles.jobTitle}>Senior React Developer</Text>
          <View style={styles.jobDetailRow}>
            <Building2 size={16} color={MO_TEXT_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.companyName}>FinTech S.A.</Text>
          </View>
          <View style={styles.jobDetailRow}>
            <MapPin size={16} color={MO_TEXT_SECONDARY} style={styles.detailIcon} />
            <Text style={styles.detailText}>Warszawa / Hybrydowo</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Historia Aplikacji</Text>

        <View style={styles.timelineContainer}>
          {mockTimeline.map((event, index) => {
            const isLast = index === mockTimeline.length - 1;
            
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
                        event.type === 'INVITED' && styles.eventTitleSuccess
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
  eventTitleSuccess: { color: '#047857', fontWeight: '800' }
});
