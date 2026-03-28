export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

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
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Candidate-Id': candidateId,
      },
      body: JSON.stringify({
        jobId,
        candidateId,
        employerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Application failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
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
