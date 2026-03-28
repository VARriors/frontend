/**
 * Job requirements API client for candidates.
 *
 * Handles CV requirement checks before job application.
 */

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

interface JobCVRequirement {
  job_id: string;
  requires_cv: boolean;
  cv_required_reason?: string | null;
}

interface CVRequirementValidation {
  valid: boolean;
  requires_cv: boolean;
  has_cv: boolean;
  reason?: string | null;
}

/**
 * Get CV requirement info for a specific job.
 */
export async function getJobCVRequirement(
  jobId: string,
): Promise<JobCVRequirement> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${jobId}/cv-requirement`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get CV requirement: ${response.status}`);
    }

    return (await response.json()) as JobCVRequirement;
  } catch (error) {
    console.error('Error fetching job CV requirement:', error);
    throw error;
  }
}

/**
 * Validate if a candidate meets the CV requirement for a job before applying.
 *
 * Returns validation result including:
 * - valid: Whether the candidate can apply
 * - requires_cv: Whether the job requires a CV
 * - has_cv: Whether the candidate has a CV
 * - reason: Error message if not valid
 */
export async function validateJobCVRequirement(
  jobId: string,
  candidateId: string,
): Promise<CVRequirementValidation> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/${jobId}/validate-cv-requirement/${candidateId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Candidate-Id': candidateId,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.status}`);
    }

    return (await response.json()) as CVRequirementValidation;
  } catch (error) {
    console.error('Error validating CV requirement:', error);
    throw error;
  }
}
