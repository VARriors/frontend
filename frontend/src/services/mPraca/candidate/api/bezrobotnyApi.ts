type ApiMethod = 'GET' | 'POST';

type CandidateContextResponse = {
  candidateId: string;
  employmentStatus?: string | null;
  isRegisteredAsUnemployed?: boolean;
  registeredAsUnemployedAt?: string | null;
};

type RegisterUnemployedResponse = {
  message: string;
  candidateId: string;
  employmentStatus?: string | null;
  isRegisteredAsUnemployed?: boolean;
  registeredAsUnemployedAt?: string | null;
};

export type BezrobotnyStatus = {
  candidateId: string;
  employmentStatus: string | null;
  isRegisteredAsUnemployed: boolean;
  registeredAsUnemployedAt: string | null;
};

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://10.0.2.2:5000/api'
)
  .replace(/\/$/, '')
  .replace(/\/api$/, '');
const CANDIDATE_ID = process.env.EXPO_PUBLIC_CANDIDATE_ID;
const CANDIDATE_ID_STORAGE_KEY = 'mpraca_candidate_id';

let runtimeCandidateId = CANDIDATE_ID || '';

const readStoredCandidateId = () => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const stored = localStorage.getItem(CANDIDATE_ID_STORAGE_KEY);
    if (stored && stored.trim()) {
      runtimeCandidateId = stored.trim();
    }
  } catch {
    // Ignore storage access errors.
  }
};

const persistCandidateId = (candidateId: string) => {
  runtimeCandidateId = candidateId;
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CANDIDATE_ID_STORAGE_KEY, candidateId);
  } catch {
    // Ignore storage access errors.
  }
};

readStoredCandidateId();

const parseApiError = async (response: Response) => {
  try {
    const payload = await response.json();
    if (typeof payload?.error === 'string') {
      return payload.error;
    }
  } catch {
    // Ignore parse errors and fallback to status text.
  }

  return `Request failed (${response.status} ${response.statusText})`;
};

const seedDemoCandidate = async () => {
  const response = await fetch(`${API_BASE_URL}/api/candidates/questionnaire/seed-demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ create_cv: false }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const payload = (await response.json()) as { candidate_id?: string };
  const candidateId = typeof payload.candidate_id === 'string' ? payload.candidate_id.trim() : '';
  if (!candidateId) {
    throw new Error('Seed candidate response missing candidate_id');
  }

  persistCandidateId(candidateId);
  return candidateId;
};

const getOrCreateCandidateId = async () => {
  if (runtimeCandidateId) {
    return runtimeCandidateId;
  }

  return seedDemoCandidate();
};

const apiRequest = async <T>(path: string, method: ApiMethod, body?: unknown): Promise<T> => {
  const candidateId = await getOrCreateCandidateId();
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

const mapStatus = (payload: CandidateContextResponse | RegisterUnemployedResponse): BezrobotnyStatus => ({
  candidateId: payload.candidateId,
  employmentStatus: typeof payload.employmentStatus === 'string' ? payload.employmentStatus : null,
  isRegisteredAsUnemployed: payload.isRegisteredAsUnemployed === true,
  registeredAsUnemployedAt:
    typeof payload.registeredAsUnemployedAt === 'string' ? payload.registeredAsUnemployedAt : null,
});

export const getBezrobotnyStatus = async (): Promise<BezrobotnyStatus> => {
  const response = await apiRequest<CandidateContextResponse>('/api/candidate/context', 'GET');
  return mapStatus(response);
};

export const registerAsUnemployed = async (): Promise<BezrobotnyStatus> => {
  const response = await apiRequest<RegisterUnemployedResponse>('/api/candidate/register-unemployed', 'POST');
  return mapStatus(response);
};
