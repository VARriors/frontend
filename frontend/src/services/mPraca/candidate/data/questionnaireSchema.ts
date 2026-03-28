import { z } from 'zod';

// ─── Województwa ──────────────────────────────────────────────────
export const WOJEWODZTWA = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
] as const;

// ─── Poziomy językowe ─────────────────────────────────────────────
export const POZIOMY_JEZYKOWE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'natywny'] as const;

// ─── Branże (z istniejącego screens/preferences.tsx) ──────────────
export const BRANZE = [
  'IT / Technologia',
  'Gastronomia',
  'Budownictwo',
  'Administracja',
  'Sprzedaż i Obsługa Klienta',
  'Edukacja',
  'Logistyka i Transport',
  'Praca fizyczna',
  'Księgowość',
  'Służba Zdrowia',
] as const;

// ─── Sub-schemas ──────────────────────────────────────────────────

/** Doświadczenie zawodowe – matches backend doswiadczenia_zawodowe[] */
export const doswiadczenieSchema = z.object({
  stanowisko: z.string().min(1, 'Stanowisko jest wymagane'),
  firma: z.string().min(1, 'Nazwa firmy jest wymagana'),
  od: z.string().min(1, 'Data rozpoczęcia jest wymagana'), // format: YYYY-MM
  do: z.string().optional(), // puste = "do teraz"
});

/** Język obcy + poziom */
export const jezykSchema = z.object({
  jezyk: z.string().min(1, 'Nazwa języka jest wymagana'),
  poziom: z.enum([...POZIOMY_JEZYKOWE], { message: 'Wybierz poziom' }),
});

/** Szkolenie/kurs */
export const szkolenieSchema = z.object({
  nazwa: z.string().min(1, 'Nazwa szkolenia jest wymagana'),
  organizator: z.string().optional(),
  rok: z.string().optional(),
});

/** Certyfikat */
export const certyfikatSchema = z.object({
  nazwa: z.string().min(1, 'Nazwa certyfikatu jest wymagana'),
  wystawca: z.string().optional(),
  data_wydania: z.string().optional(),
});

/** Aktywność dodatkowa (np. wolontariat) */
export const aktywnoscSchema = z.object({
  opis: z.string().min(1, 'Opis aktywności jest wymagany'),
  organizacja: z.string().optional(),
  okres: z.string().optional(),
});

/** Ekstrahowane dane z CV */
export const cvExtractedDataSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  languages: z.array(z.object({
    jezyk: z.string(),
    poziom: z.string(),
  })).optional(),
  skills: z.array(z.string()).optional(),
});

/** CV - dokument PDF z wyekstrahowanymi danymi */
export const cvSchema = z.object({
  file_id: z.string(),
  filename: z.string().optional(),
  uploaded_at: z.string().optional(),
  extraction_status: z.enum(['success', 'failed', 'pending']).optional(),
  extracted_data: cvExtractedDataSchema.optional(),
}).optional();

// ─── Główny schemat ───────────────────────────────────────────────

export const questionnaireFormSchema = z.object({
  // ── SEKCJA 1: mObywatel (readOnly – front-end validation nie jest tu krytyczna,
  //    bo dane przychodzą z backendu, ale definiujemy dla kompletności typów)
  imie: z.string().min(1, 'Imię jest wymagane'),
  nazwisko: z.string().min(1, 'Nazwisko jest wymagane'),
  pesel: z.string().optional().or(z.literal('')), 
  dowod: z.string().optional().or(z.literal('')),
  niepelnosprawnosc: z.boolean(),

  // ── SEKCJA 2: Kwestionariusz (pola edytowalne przez użytkownika)
  nr_telefonu: z
    .string()
    .min(1, 'Numer telefonu jest wymagany')
    .regex(
      /^(\+48)?\s?\d{3}\s?\d{3}\s?\d{3}$/,
      'Format: +48 XXX XXX XXX lub XXX XXX XXX',
    ),
  email: z
    .string()
    .min(1, 'Adres e-mail jest wymagany')
    .email('Podaj poprawny adres e-mail'),

  preferencje: z
    .array(z.string())
    .min(1, 'Wybierz przynajmniej jedną branżę'),

  wojewodztwo: z.string().min(1, 'Województwo jest wymagane'),
  miasto: z.string().optional(),

  // ── SEKCJA 3: Doświadczenie i kompetencje (dynamic arrays / FieldArrays)
  doswiadczenia_zawodowe: z.array(doswiadczenieSchema).optional(),
  jezyki: z.array(jezykSchema).optional(),
  szkolenia: z.array(szkolenieSchema).optional(),
  certyfikaty: z.array(certyfikatSchema).optional(),
  aktywnosc_dodatkowa: z.array(aktywnoscSchema).optional(),

  // ── SEKCJA 4: Dokument CV (PDF z wyekstrahowanymi danymi)
  cv: cvSchema,
});

export type QuestionnaireFormValues = z.infer<typeof questionnaireFormSchema>;
export type Doswiadczenie = z.infer<typeof doswiadczenieSchema>;
export type Jezyk = z.infer<typeof jezykSchema>;
export type Szkolenie = z.infer<typeof szkolenieSchema>;
export type Certyfikat = z.infer<typeof certyfikatSchema>;
export type Aktywnosc = z.infer<typeof aktywnoscSchema>;
export type CVExtractedData = z.infer<typeof cvExtractedDataSchema>;
export type CV = z.infer<typeof cvSchema>;
