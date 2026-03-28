import type { QuestionnaireFormValues } from './questionnaireSchema';

// ─── Default values do formularza (nadpisywane po fetchu z backendu) ───────
export const QUESTIONNAIRE_DEFAULT_VALUES: QuestionnaireFormValues = {
  // Dane z mObywatel (readOnly)
  imie: '',
  nazwisko: '',
  pesel: '',
  dowod: '',
  niepelnosprawnosc: false,

  // Dane użytkownika (editable)
  nr_telefonu: '',
  email: '',
  preferencje: [],
  pref_typ_umowy: [],
  pref_wymiar_etatu: [],
  wojewodztwo: '',
  miasto: '',

  // Doświadczenie i kompetencje (puste, bo użytkownik może pobrać z ZUS/UP)
  doswiadczenia_zawodowe: [],
  jezyki: [],
  szkolenia: [],
  certyfikaty: [],
  aktywnosc_dodatkowa: [],
};
