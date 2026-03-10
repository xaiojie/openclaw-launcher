export const validateTelegramToken = (token: string): boolean => /^\d+:[\w-]+$/.test(token);
