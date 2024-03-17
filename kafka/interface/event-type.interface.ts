export const eventTypes = [
  'user.welcome',
  'user.reset-password',
  'user.verify-email',
] as const;

export interface EventPayloads {
  'user.welcome': { name: string; email: string };
  'user.reset-password': { name: string; email: string; link: string };
  'user.verify-email': { name: string; email: string; otp: string };
}