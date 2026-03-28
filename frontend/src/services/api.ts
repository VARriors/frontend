export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';
const CANDIDATE_ID_STORAGE_KEY = 'mpraca_candidate_id';

const persistCandidateId = (candidateId: string) => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CANDIDATE_ID_STORAGE_KEY, candidateId);
  } catch {
    // Ignore storage failures in private mode or restricted environments.
  }
};

const seedDemoCandidate = async () => {
  const response = await fetch(`${API_BASE_URL}/candidates/questionnaire/seed-demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ create_cv: false }),
  });

  if (!response.ok) {
    return null;
  }

  try {
    const payload = (await response.json()) as { candidate_id?: string };
    const candidateId = typeof payload.candidate_id === 'string' ? payload.candidate_id.trim() : '';
    if (!candidateId) {
      return null;
    }
    persistCandidateId(candidateId);
    return candidateId;
  } catch {
    return null;
  }
};

export type EmployerByNipResponse = {
  _id: string;
  nip?: string;
  name?: string;
  company?: string;
};

export type EmployerJobApplicationItem = {
  applicationId: string;
  candidateId?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  selectedDocuments?: string[];
  candidate?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export type EmployerOfferWithApplications = {
  id: string;
  title: string;
  company?: string;
  location?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  applicationsCount: number;
  applications: EmployerJobApplicationItem[];
};

export type EmployerOffersWithApplicationsResponse = {
  employerId: string;
  jobsCount: number;
  applicationsCount: number;
  items: EmployerOfferWithApplications[];
};

export const fetchJobs = async (query = '') => {
  try {
    const url = new URL(`${API_BASE_URL}/jobs`);
    if (query) {
      url.searchParams.append('q', query);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('fetchJobs Error:', error);
    return [];
  }
};

export const fetchJob = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching job: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('fetchJob Error:', error);
    return null;
  }
};

export const fetchJobApplicants = async (employerId: string, jobId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/employers/applications/${employerId}/job/${jobId}`);
    if (!response.ok) {
      throw new Error(`Error fetching applicants: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('fetchJobApplicants Error:', error);
    return { items: [], total: 0 };
  }
};

export const fetchEmployerByNip = async (nip: string) => {
  try {
    const cleanNip = nip.trim();
    if (!cleanNip) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/employers/by-nip/${encodeURIComponent(cleanNip)}`);
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as EmployerByNipResponse;
  } catch (error) {
    console.error('fetchEmployerByNip Error:', error);
    return null;
  }
};

export const fetchEmployerOffersWithApplications = async (employerId: string, includeEmpty = true) => {
  try {
    const includeEmptyParam = includeEmpty ? 'true' : 'false';
    const response = await fetch(
      `${API_BASE_URL}/employers/${encodeURIComponent(employerId)}/jobs-with-applications?includeEmpty=${includeEmptyParam}`
    );
    if (!response.ok) {
      throw new Error(`Error fetching employer offers: ${response.statusText}`);
    }
    return (await response.json()) as EmployerOffersWithApplicationsResponse;
  } catch (error) {
    console.error('fetchEmployerOffersWithApplications Error:', error);
    return {
      employerId,
      jobsCount: 0,
      applicationsCount: 0,
      items: [],
    };
  }
};

export const fetchCandidateProfile = async (candidateId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates/profile/${candidateId}`);
    if (!response.ok) {
      throw new Error(`Error fetching candidate profile: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('fetchCandidateProfile Error:', error);
    return null;
  }
};

export const applyForJob = async (jobId: string, candidateId: string, employerId?: string) => {
  const parseErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      if (typeof body?.error === 'string' && body.error.trim()) {
        return body.error;
      }
    } catch {
      // Ignore non-JSON error payloads.
    }
    return response.statusText || `HTTP ${response.status}`;
  };

  const sendApplyRequest = async (resolvedCandidateId: string) => {
    const payload = {
      jobId,
      candidateId: resolvedCandidateId,
      employerId,
    };

    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Candidate-Id': resolvedCandidateId,
      },
      body: JSON.stringify(payload),
    };

    let response = await fetch(`${API_BASE_URL}/candidate/applications`, requestInit);
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/candidate/apply`, requestInit);
    }

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(response);
      throw new Error(`Application failed: ${errorMessage}`);
    }

    return response.json();
  };

  try {
    return await sendApplyRequest(candidateId);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const shouldRetryWithSeed = message.includes('candidate not found');

    if (shouldRetryWithSeed) {
      const seededCandidateId = await seedDemoCandidate();
      if (seededCandidateId) {
        return sendApplyRequest(seededCandidateId);
      }
    }

    console.error('applyForJob Error:', error);
    throw error;
  }
};

export const checkHasApplied = async (jobId: string, candidateId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/applications/check?jobId=${jobId}&candidateId=${candidateId}`, {
      headers: {
        'X-Candidate-Id': candidateId,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.applied || false;
  } catch (error) {
    console.error('checkHasApplied Error:', error);
    return false;
  }
};
