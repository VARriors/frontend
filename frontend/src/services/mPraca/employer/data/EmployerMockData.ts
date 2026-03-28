export type AppStatus = 'UNREAD' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';

export interface ApplicationBadge {
  id: string;
  name: string;
  isVerified: boolean; // Zawsze true dla profili mObywatel, ale warto trzymać strukturę
}

export interface CandidateApplication {
  id: string;
  name: string;
  title: string;
  summary: string;
  fullCvText: string;
  hasSanepid: boolean;
  cleanCriminalRecord: boolean;
  hasDrivingLicense: boolean;
  aiMatchScore: number; // 0 - 100
  status: AppStatus;
}

export const mockCandidates: CandidateApplication[] = [];
