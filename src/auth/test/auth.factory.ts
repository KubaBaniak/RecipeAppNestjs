import { authenticator } from 'otplib';

type TwoFactorAuthOverrides = {
  secretKey?: string;
  isEnabled?: boolean;
};

type TwoFactorAuthRecoveryKeyOverrides = {
  key?: string;
  isUsed?: boolean;
  usedAt?: Date;
};

export const add2faToUserWithId = (
  userId: number,
  overrides: TwoFactorAuthOverrides = {},
) => ({
  secretKey: overrides.secretKey ?? authenticator.generateSecret(),
  userId,
  isEnabled: overrides.isEnabled ?? false,
});

export const addRecoveryKeyFor2fa = (
  twoFactorAuthId: number,
  overrides: TwoFactorAuthRecoveryKeyOverrides = {},
) => ({
  twoFactorAuthId,
  key: overrides.key ?? authenticator.generateSecret(),
  isUsed: overrides.isUsed ?? false,
  usedAt: overrides.usedAt ?? new Date(),
});
