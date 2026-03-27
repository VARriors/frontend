export const OnboardingState = {
  hasCompletedPreferences: false,
};

export const setPreferencesCompleted = (status: boolean) => {
  OnboardingState.hasCompletedPreferences = status;
};
