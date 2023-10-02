import 'dotenv/config';

export const BCRYPT = {
  salt: +process.env.BCRYPT_SALT_ROUNDS,
};

export const SERVICE = { name: 'Recipe App' };

export const NUMBER_OF_2FA_RECOVERY_TOKENS = 8;

export const STRATEGY = {
  bearer: 'jwt.bearer',
  pat: 'jwt.pat',
  twoFactor: '2fa.bearer',
  local: 'local',
};
