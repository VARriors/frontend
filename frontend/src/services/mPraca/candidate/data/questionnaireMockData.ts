import type { QuestionnaireFormValues } from './questionnaireSchema';

// ─── Mockowane dane z mObywatel (readOnly) ────────────────────────
// Odpowiada polu: PUT /api/candidates/questionnaire/<id>/mobywatel
export const MOCK_MOBYWATEL_PROFILE = {
  imie: 'Jan',
  nazwisko: 'Kowalski',
  pesel: '90010112345',
  dowod: 'ABC123456',
  niepelnosprawnosc: false,
};

// ─── Mockowane dane z Urzędu Pracy / ZUS ─────────────────────────
// Odpowiada polu: PUT /api/candidates/questionnaire/<id>/urzad-pracy
export const MOCK_URZAD_PRACY_DATA = {
  doswiadczenia_zawodowe: [
    {
      stanowisko: 'Specjalista ds. IT',
      firma: 'Ministerstwo Cyfryzacji',
      od: '2022-01',
      do: '2024-12',
    },
    {
      stanowisko: 'Junior Developer',
      firma: 'GovTech Solutions Sp. z o.o.',
      od: '2020-06',
      do: '2021-12',
    },
  ],
};

// ─── Default values do formularza (pre-filled z mObywatela) ───────
export const QUESTIONNAIRE_DEFAULT_VALUES: QuestionnaireFormValues = {
  // Dane z mObywatel (readOnly)
  imie: MOCK_MOBYWATEL_PROFILE.imie,
  nazwisko: MOCK_MOBYWATEL_PROFILE.nazwisko,
  pesel: MOCK_MOBYWATEL_PROFILE.pesel,
  dowod: MOCK_MOBYWATEL_PROFILE.dowod,
  niepelnosprawnosc: MOCK_MOBYWATEL_PROFILE.niepelnosprawnosc,

  // Dane użytkownika (editable)
  nr_telefonu: '',
  email: '',
  preferencje: [],
  wojewodztwo: '',
  miasto: '',

  // Doświadczenie i kompetencje (puste, bo użytkownik może pobrać z ZUS/UP)
  doswiadczenia_zawodowe: [],
  jezyki: [],
  szkolenia: [],
  certyfikaty: [],
  aktywnosc_dodatkowa: [],
};

// ─── Candidate ID (demo) ─────────────────────────────────────────
export const DEMO_CANDIDATE_ID = 'cand-123';
