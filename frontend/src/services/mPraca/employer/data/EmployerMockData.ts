export type AppStatus = 'UNREAD' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';

export interface ApplicationBadge {
  id: string;
  name: string;
  isVerified: boolean; // Zawsze true dla profili mObywatel, ale warto trzymać strukturę
}

export interface CandidateApplication {
  id: string;
  candidateId?: string;
  name: string;
  title: string;
  summary: string;
  fullCvText: string;
  hasSanepid: boolean;
  cleanCriminalRecord: boolean;
  hasDrivingLicense: boolean;
  prefTypUmowy: string[];
  prefWymiarEtatu: string[];
  prefBranze: string[];
  aiMatchScore: number; // 0 - 100
  aiMatchFeedback?: string;
  aiMatchSummary?: string;
  status: AppStatus;
}

export const mockCandidates: CandidateApplication[] = [];
