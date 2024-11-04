export const env = {
  MAILGUN_API_KEY: import.meta.env.VITE_MAILGUN_API_KEY,
  MAILGUN_DOMAIN: import.meta.env.VITE_MAILGUN_DOMAIN,
} as const;