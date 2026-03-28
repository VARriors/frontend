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
