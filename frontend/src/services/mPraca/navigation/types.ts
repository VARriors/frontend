export type MPracaStackParamList = {
  LandingPage: undefined;
  CandidateFlow: undefined; // To go via CVGuard
  AddCV: undefined;
  Preferences: undefined;
  JobOffers: undefined;
  JobSearch: undefined;
  MyApplications: undefined;
  ApplicationDetails: { applicationId?: string } | undefined;
  CandidateDashboard: undefined;
  EmployerDashboard: undefined;
  CreateJobOffer: undefined;
  CandidatesList: undefined;
  CandidateProfile: { candidateId?: string } | undefined;
};
