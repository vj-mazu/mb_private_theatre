// In-memory OTP store for phone verification
export const activeOtps = new Map<string, { code: string; expiresAt: number }>();
