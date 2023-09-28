import 'dotenv/config';

export const bcryptConstants = {
  salt: +process.env.BCRYPT_SALT_ROUNDS,
};

export const serviceConstants = { name: 'Recipe App' };

export const numberOf2faRecoveryTokens = 8;

export const strategyNameConstants = {
  jwt: {
    bearer: 'jwt.bearer',
    pat: 'jwt.pat',
    twoFactor: '2fa.bearer',
  },
  local: 'local',
};
