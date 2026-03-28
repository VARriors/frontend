export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  hasSanepid: boolean;
  cleanCriminalRecord: boolean;
  hasDrivingLicense: boolean;
}

export const mockCandidateProfile: CandidateProfile = {
  id: 'cand-123',
  firstName: 'Jan',
  lastName: 'Kowalski',
  hasSanepid: true,
  cleanCriminalRecord: true,
  hasDrivingLicense: false,
};

export type RequirementId = 'sanepid' | 'krk' | 'driving_license';

export interface JobOffer {
  id: string;
  employer_id?: string;
  employerId?: string;
  title: string;
  company: string;
  salaryRange: string;
  description: string;
  category: string;
  requiredBadges: RequirementId[];
  employmentType?: string;
  workTime?: string;
  workMode?: string;
  positionLevel?: string;
  minExperience?: string;
  minEducation?: string;
  languages?: string[];
  expectations?: string;
  tags?: string[];
  benefits?: string[];
  responsibilities?: string[];
  applicationDeadline?: string;
  location?: string;
}

export const mockJobOffers: JobOffer[] = [];
