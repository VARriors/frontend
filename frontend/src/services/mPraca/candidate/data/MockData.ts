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
  title: string;
  company: string;
  salaryRange: string;
  description: string;
  category: string;
  requiredBadges: RequirementId[];
}

export const mockJobOffers: JobOffer[] = [
  {
    id: '1',
    title: 'Kucharz / Pomoc kuchenna',
    company: 'Restauracja Smaki Polskie',
    salaryRange: '4500 - 6000 PLN (brutto)',
    description: 'Poszukujemy doświadczonego kucharza lub osoby do pomocy w kuchni. Wymagana aktualna książeczka sanepidowska, którą zweryfikujemy bezpośrednio przez Twój profil w mObywatel.',
    category: 'Gastronomia',
    requiredBadges: ['sanepid'],
  },
  {
    id: '2',
    title: 'Kurier (Kat. B)',
    company: 'SzybkaPaczka sp. z o.o.',
    salaryRange: '5000 - 8000 PLN (brutto)',
    description: 'Dostarczanie przesyłek na terenie miasta. Wymagane zaświadczenie o niekaralności z Krajowego Rejestru Karnego oraz prawo jazdy kat. B.',
    category: 'Transport',
    requiredBadges: ['driving_license', 'krk'],
  },
  {
    id: '3',
    title: 'Specjalista ds. Finansów',
    company: 'Biuro Rachunkowe "Zysk"',
    salaryRange: '6000 - 9000 PLN (brutto)',
    description: 'Prowadzenie pełnej księgowości i dbałość o poufną dokumentację finansową. Ze względu na charakter pracy konieczne jest potwierdzenie niekaralności.',
    category: 'Administracja',
    requiredBadges: ['krk'],
  },
  {
    id: '4',
    title: 'Frontend Developer (React Native)',
    company: 'GovTech Solutions',
    salaryRange: '12000 - 18000 PLN (B2B)',
    description: 'Szukamy Mida/Seniora na React Native do nowoczesnego projektu mobilnego.',
    category: 'IT',
    requiredBadges: [],
  },
  {
    id: '5',
    title: 'Dostawca Jedzenia',
    company: 'Pyszne Dowozy',
    salaryRange: '3500 - 5500 PLN (brutto)',
    description: 'Dowożenie zamówień własnym pojazdem. Konieczne badania sanitarno-epidemiologiczne.',
    category: 'Gastronomia',
    requiredBadges: ['sanepid'],
  }
];
