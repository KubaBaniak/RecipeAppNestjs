import 'dotenv/config';

export const bcryptConstants = {
  salt: +process.env.BCRYPT_SALT_ROUNDS,
};

export const strategyNameConstants = {
  jwt: {
    passwordReset: 'password-reset.bearer',
  },
};
