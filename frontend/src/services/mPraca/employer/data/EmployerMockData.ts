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

export const mockCandidates: CandidateApplication[] = [
  {
    id: 'cand-001',
    name: 'Anna Kowalska',
    title: 'Senior React Native Developer',
    summary: 'Doświadczenie 5+ lat w tworzeniu skalowalnych aplikacji mobilnych. Ostatnio lider techniczny w sektorze finansowym.',
    fullCvText: 'Doświadczenie:\n2020-Obecnie: Tech Lead w FinTech S.A.\n2018-2020: Mobile Developer w AppsCorp\n\nEdukacja:\nPolitechnika Warszawska, Inżynieria Oprogramowania\n\nUmiejętności: React Native, TypeScript, Redux, Zustand, CI/CD, App Store Connect.',
    hasSanepid: false,
    cleanCriminalRecord: true,
    hasDrivingLicense: false,
    aiMatchScore: 98,
    status: 'UNREAD',
  },
  {
    id: 'cand-002',
    name: 'Marek Nowak',
    title: 'Kucharz / Szef Zmiany',
    summary: 'Pasjonat kuchni polskiej i europejskiej. 10 lat doświadczenia w zarządzaniu kuchnią.',
    fullCvText: 'Doświadczenie:\n2015-Obecnie: Szef Kuchni w "Stara Wędzarnia"\n2011-2015: Kucharz zmianowy "Bistro pod Mostem"\n\nEdukacja:\nZasadnicza Szkoła Gastronomiczna\n\nDodatkowe certyfikaty:\nKurs Sous-Vide, Higiena żywnienia HACCP.',
    hasSanepid: true,
    cleanCriminalRecord: true,
    hasDrivingLicense: true,
    aiMatchScore: 85,
    status: 'VIEWED',
  },
  {
    id: 'cand-003',
    name: 'Piotr Wiśniewski',
    title: 'Mid Frontend Dev',
    summary: 'Programista React z 2-letnim doświadczeniem. Chętnie rozwijający się w kierunku architekta aplikacji.',
    fullCvText: 'Doświadczenie:\n2022-Obecnie: Junior/Mid Dev w IT House\n\nEdukacja:\nUniwersytet Gdański, Informatyka Profil Praktyczny\n\nUmiejętności: JS, TS, React, CSS Modules',
    hasSanepid: false,
    cleanCriminalRecord: true,
    hasDrivingLicense: true,
    aiMatchScore: 78,
    status: 'UNREAD',
  },
  {
    id: 'cand-004',
    name: 'Katarzyna Lis',
    title: 'Kurier Miejski',
    summary: 'Doskonała znajomość topografii miasta. Zawsze terminowa.',
    fullCvText: 'Doświadczenie:\n2021-2023: Dostawca jedzenia PizzaFast\n2019-2021: Kurier Paczkowy\n\nPosiadam własny samochód dostawczy kat. B.',
    hasSanepid: true,
    cleanCriminalRecord: false, // Opcjonalnie mogło coś być w historii
    hasDrivingLicense: true,
    aiMatchScore: 92,
    status: 'ACCEPTED',
  },
  {
    id: 'cand-005',
    name: 'Robert Lewandowski',
    title: 'Junior IT Support',
    summary: 'Świeżo po studiach, poszukuję pierwszej pracy w pełnym wymiarze, gotów na wyzwania i rozwiązywanie problemów użytkowników.',
    fullCvText: 'Edukacja:\nWydział Informatyki, Politechnika Poznańska\n\nDoświadczenie:\nPraktyki studenckie w dziale wsparcia (Helpdesk Level 1)\n\nCertyfikaty:\nCompTIA A+ (w toku).',
    hasSanepid: false,
    cleanCriminalRecord: true,
    hasDrivingLicense: false,
    aiMatchScore: 45,
    status: 'REJECTED',
  },
  {
    id: 'cand-006',
    name: 'Ewa Maj',
    title: 'Specjalista ds. Księgowości',
    summary: 'Dokładna i rzetelna księgowa, 4 lata doświadczenia z KPiR oraz pełną księgowością.',
    fullCvText: 'Doświadczenie:\n2019-2023: Księgowa, Biuro Rachunkowe Bilans\n\nProgramy:\nOptima, Symfonia, Płatnik ZUS.\n\nEdukacja:\nFinanse i Rachunkowość, Uniwersytet Ekonomiczny.',
    hasSanepid: false,
    cleanCriminalRecord: true,
    hasDrivingLicense: false,
    aiMatchScore: 82,
    status: 'UNREAD',
  }
];
