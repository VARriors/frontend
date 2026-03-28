import {
  type Aktywnosc,
  type Certyfikat,
  POZIOMY_JEZYKOWE,
  type Doswiadczenie,
  type Jezyk,
  type QuestionnaireFormValues,
  type Szkolenie,
  WOJEWODZTWA,
} from '@/src/services/mPraca/candidate/data/questionnaireSchema';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type QuestionnaireFieldPayload = {
  value: unknown;
  verification?: {
    source?: string;
    status?: string;
    verified_by?: string | null;
    verified_at?: string | null;
    note?: string | null;
  };
};

type QuestionnaireResponse = {
  candidate_id: string;
  questionnaire: {
    fields: Record<string, QuestionnaireFieldPayload>;
    updated_at?: string;
  };
  completion?: {
    is_complete: boolean;
    missing_fields: string[];
  };
};

type CandidateContextResponse = {
  candidateId: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  };
  questionnaireComplete?: boolean;
  missingFields?: string[];
};

type MobywatelPayload = {
  fields: {
    imie: string;
    nazwisko: string;
    pesel: string;
    dowod: string;
    niepelnosprawnosc: boolean;
  };
};

type UserInputPayload = {
  fields: {
    nr_telefonu: string;
    email: string;
    preferencje: string[];
    obszar_poszukiwan: string;
    jezyki: string[];
    szkolenia: string[];
    certyfikaty: string[];
    aktywnosc_dodatkowa: string[];
  };
};

type UrzadPracyPayload = {
  fields: {
    doswiadczenia_zawodowe: {
      stanowisko: string;
      firma: string;
      od: string;
      do?: string;
    }[];
  };
};

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const CANDIDATE_ID = process.env.EXPO_PUBLIC_CANDIDATE_ID;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const getRequiredCandidateId = () => {
  if (!CANDIDATE_ID) {
    throw new Error('Missing EXPO_PUBLIC_CANDIDATE_ID environment variable');
  }
  return CANDIDATE_ID;
};

const parseApiError = async (response: Response) => {
  try {
    const payload = await response.json();
    if (typeof payload?.error === 'string') {
      if (payload?.details) {
        return `${payload.error}: ${JSON.stringify(payload.details)}`;
      }
      return payload.error;
    }
  } catch {
    // Ignore parse errors and fallback to status text.
  }

  return `Request failed (${response.status} ${response.statusText})`;
};

const apiRequest = async <T>(path: string, method: ApiMethod, body?: unknown): Promise<T> => {
  const candidateId = getRequiredCandidateId();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Candidate-Id': candidateId,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as T;
};

const extractFieldValue = <T>(fields: Record<string, QuestionnaireFieldPayload>, field: string, fallback: T): T => {
  const payload = fields[field];
  if (!payload || payload.value === null || payload.value === undefined) {
    return fallback;
  }
  return payload.value as T;
};

const parseArea = (obszar: string): { wojewodztwo: string; miasto: string } => {
  const normalized = (obszar || '').trim();
  if (!normalized) {
    return { wojewodztwo: '', miasto: '' };
  }

  const matched = WOJEWODZTWA.find((woj) => normalized.toLowerCase().startsWith(woj.toLowerCase()));
  if (!matched) {
    return { wojewodztwo: '', miasto: normalized };
  }

  const remainder = normalized.slice(matched.length).replace(/^\s*,\s*/, '').trim();
  return { wojewodztwo: matched, miasto: remainder };
};

const parseLanguage = (value: unknown): Jezyk => {
  if (typeof value !== 'string') {
    return { jezyk: '', poziom: 'B1' };
  }

  const trimmed = value.trim();
  const parsed = trimmed.match(/^(.*)\(([^)]+)\)$/);
  if (!parsed) {
    return { jezyk: trimmed, poziom: 'B1' };
  }

  const level = parsed[2].trim();
  const isValidLevel = POZIOMY_JEZYKOWE.includes(level as (typeof POZIOMY_JEZYKOWE)[number]);
  return {
    jezyk: parsed[1].trim(),
    poziom: isValidLevel ? (level as Jezyk['poziom']) : 'B1',
  };
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
};

const toExperienceArray = (value: unknown): Doswiadczenie[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asRecord(item))
    .map((item) => ({
      stanowisko: String(item.stanowisko || ''),
      firma: String(item.firma || ''),
      od: String(item.od || ''),
      do: item.do ? String(item.do) : '',
    }))
    .filter((item) => item.stanowisko || item.firma || item.od || item.do);
};

export const mapQuestionnaireToFormValues = (response: QuestionnaireResponse): QuestionnaireFormValues => {
  const fields = response.questionnaire?.fields || {};
  const obszar = extractFieldValue(fields, 'obszar_poszukiwan', '');
  const parsedArea = parseArea(typeof obszar === 'string' ? obszar : '');

  return {
    imie: extractFieldValue(fields, 'imie', ''),
    nazwisko: extractFieldValue(fields, 'nazwisko', ''),
    pesel: extractFieldValue(fields, 'pesel', ''),
    dowod: extractFieldValue(fields, 'dowod', ''),
    niepelnosprawnosc: Boolean(extractFieldValue(fields, 'niepelnosprawnosc', false)),
    nr_telefonu: extractFieldValue(fields, 'nr_telefonu', ''),
    email: extractFieldValue(fields, 'email', ''),
    preferencje: toStringArray(extractFieldValue(fields, 'preferencje', [])),
    wojewodztwo: parsedArea.wojewodztwo,
    miasto: parsedArea.miasto,
    doswiadczenia_zawodowe: toExperienceArray(extractFieldValue(fields, 'doswiadczenia_zawodowe', [])),
    jezyki: toStringArray(extractFieldValue(fields, 'jezyki', [])).map(parseLanguage),
    szkolenia: toStringArray(extractFieldValue(fields, 'szkolenia', [])).map((nazwa) => ({
      nazwa,
      organizator: '',
      rok: '',
    })),
    certyfikaty: toStringArray(extractFieldValue(fields, 'certyfikaty', [])).map((nazwa) => ({
      nazwa,
      wystawca: '',
      data_wydania: '',
    })),
    aktywnosc_dodatkowa: toStringArray(extractFieldValue(fields, 'aktywnosc_dodatkowa', [])).map((opis) => ({
      opis,
      organizacja: '',
      okres: '',
    })),
  };
};

export const buildMobywatelPayload = (data: QuestionnaireFormValues): MobywatelPayload => ({
  fields: {
    imie: data.imie,
    nazwisko: data.nazwisko,
    pesel: data.pesel,
    dowod: data.dowod,
    niepelnosprawnosc: data.niepelnosprawnosc,
  },
});

export const buildUserInputPayload = (data: QuestionnaireFormValues): UserInputPayload => ({
  fields: {
    nr_telefonu: data.nr_telefonu,
    email: data.email,
    preferencje: data.preferencje,
    obszar_poszukiwan: `${data.wojewodztwo}${data.miasto ? `, ${data.miasto}` : ''}`,
    jezyki: (data.jezyki ?? []).map((j: Jezyk) => `${j.jezyk} (${j.poziom})`),
    szkolenia: (data.szkolenia ?? []).map((sz: Szkolenie) => sz.nazwa),
    certyfikaty: (data.certyfikaty ?? []).map((c: Certyfikat) => c.nazwa),
    aktywnosc_dodatkowa: (data.aktywnosc_dodatkowa ?? []).map((a: Aktywnosc) => a.opis),
  },
});

export const buildUrzadPracyPayload = (data: QuestionnaireFormValues): UrzadPracyPayload => ({
  fields: {
    doswiadczenia_zawodowe: (data.doswiadczenia_zawodowe ?? []).map((item: Doswiadczenie) => ({
      stanowisko: item.stanowisko,
      firma: item.firma,
      od: item.od,
      do: item.do || '',
    })),
  },
});

export const getCandidateContext = () => apiRequest<CandidateContextResponse>('/api/candidate/context', 'GET');

export const getQuestionnaire = (candidateId: string) =>
  apiRequest<QuestionnaireResponse>(`/api/candidates/questionnaire/${candidateId}`, 'GET');

export const putMobywatel = (candidateId: string, payload: MobywatelPayload) =>
  apiRequest(`/api/candidates/questionnaire/${candidateId}/mobywatel`, 'PUT', payload);

export const putUserInput = (candidateId: string, payload: UserInputPayload) =>
  apiRequest(`/api/candidates/questionnaire/${candidateId}/user-input`, 'PUT', payload);

export const putUrzadPracy = (candidateId: string, payload: UrzadPracyPayload) =>
  apiRequest(`/api/candidates/questionnaire/${candidateId}/urzad-pracy`, 'PUT', payload);

export const getConfiguredCandidateId = getRequiredCandidateId;

/**
 * Upload a CV file (PDF) to the server.
 * The server will extract text and parse fields (email, phone, languages, skills).
 *
 * Returns extracted data preview for the user to review.
 */
export const uploadCV = async (candidateId: string, fileData: {
  uri: string;
  name: string;
  type: string;
  file?: File;
}) => {
  const candidateIdVal = getRequiredCandidateId();
  const formData = new FormData();

  // On web, DocumentPicker provides a File object directly.
  // On native, fall back to fetching from URI and appending as Blob.
  if (fileData.file) {
    formData.append('file', fileData.file, fileData.name);
  } else {
    const response = await fetch(fileData.uri);
    const blob = await response.blob();
    formData.append('file', blob, fileData.name);
  }

  try {
    const apiResponse = await fetch(
      `${API_BASE_URL}/api/candidates/questionnaire/${candidateId}/cv-upload`,
      {
        method: 'POST',
        headers: {
          'X-Candidate-Id': candidateIdVal,
        },
        body: formData,
      },
    );

    if (!apiResponse.ok) {
      const error = await parseApiError(apiResponse);
      throw new Error(error);
    }

    const result = (await apiResponse.json()) as {
      file_id: string;
      extraction_status: 'success' | 'failed';
      extracted_data: {
        email?: string | null;
        phone?: string | null;
        languages?: { jezyk: string; poziom: string }[];
        skills?: string[];
      } | null;
      error?: string | null;
    };

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'CV upload failed');
  }
};

/**
 * Get CV metadata and extracted data for a candidate.
 * Does not return the PDF file itself.
 */
export const getCV = (candidateId: string) =>
  apiRequest<{
    cv: {
      file_id: string;
      filename?: string;
      uploaded_at?: string;
      extraction_status?: 'success' | 'failed' | 'pending';
      extracted_data?: {
        email?: string | null;
        phone?: string | null;
        languages?: { jezyk: string; poziom: string }[];
        skills?: string[];
      };
    } | null;
  }>(`/api/candidates/questionnaire/${candidateId}/cv`, 'GET');

/**
 * Delete a CV file from the server and clear it from the questionnaire.
 */
export const deleteCV = (candidateId: string) =>
  apiRequest(`/api/candidates/questionnaire/${candidateId}/cv`, 'DELETE');
