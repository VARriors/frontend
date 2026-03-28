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

export const applyForJob = async (jobId: string, candidateId: string, employerId?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        candidateId,
        employer_id: employerId,
      }),
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `Error applying for job: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('applyForJob Error:', error);
    throw error;
  }
};

export const checkHasApplied = async (jobId: string, candidateId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidate/applications?jobId=${jobId}&candidateId=${candidateId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.items && data.items.length > 0;
  } catch (error) {
    console.error('checkHasApplied Error:', error);
    return false;
  }
};
