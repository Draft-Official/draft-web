export const settingsKeys = {
  all: ['user-settings'] as const,
  byUser: (userId: string) => [...settingsKeys.all, userId] as const,
};
