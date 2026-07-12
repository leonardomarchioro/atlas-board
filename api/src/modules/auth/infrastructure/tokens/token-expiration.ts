const DURATION_PATTERN = /^(\d+)([smhd])$/;

const secondsByUnit = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
} as const;

export function getExpirationDate(expiresIn: string): Date {
  const match = DURATION_PATTERN.exec(expiresIn.trim());

  if (!match) {
    throw new Error("Invalid expiration format.");
  }

  const [, amount, unit] = match;
  const seconds =
    Number(amount) * secondsByUnit[unit as keyof typeof secondsByUnit];

  return new Date(Date.now() + seconds * 1000);
}
