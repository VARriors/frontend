const EMPLOYER_ID_STORAGE_KEY = 'mpraca:employer:id';
const EMPLOYER_NIP_STORAGE_KEY = 'mpraca:employer:nip';
const EMPLOYER_COMPANY_STORAGE_KEY = 'mpraca:employer:company';

export const DEMO_EMPLOYER_ID = 'mock-employer-1';

const readStorage = (key: string): string | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode, denied quota, etc.).
  }
};

const normalize = (value?: string | null): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getStoredEmployerId = () => normalize(readStorage(EMPLOYER_ID_STORAGE_KEY));
export const getStoredEmployerNip = () => normalize(readStorage(EMPLOYER_NIP_STORAGE_KEY));
export const getStoredEmployerCompany = () => normalize(readStorage(EMPLOYER_COMPANY_STORAGE_KEY));

export const saveEmployerSession = (payload: {
  employerId?: string | null;
  nip?: string | null;
  company?: string | null;
}) => {
  const employerId = normalize(payload.employerId);
  const nip = normalize(payload.nip);
  const company = normalize(payload.company);

  if (employerId) {
    writeStorage(EMPLOYER_ID_STORAGE_KEY, employerId);
  }
  if (nip) {
    writeStorage(EMPLOYER_NIP_STORAGE_KEY, nip);
  }
  if (company) {
    writeStorage(EMPLOYER_COMPANY_STORAGE_KEY, company);
  }
};

export const resolveEmployerIdForApp = (fallbackToDemo = true) => {
  const fromStorage = getStoredEmployerId();
  if (fromStorage) {
    return fromStorage;
  }

  const fromEnv = normalize(process.env.EXPO_PUBLIC_EMPLOYER_ID);
  if (fromEnv) {
    return fromEnv;
  }

  return fallbackToDemo ? DEMO_EMPLOYER_ID : null;
};
