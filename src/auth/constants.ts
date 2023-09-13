import 'dotenv/config';

export const bcryptConstants = {
  salt: +process.env.BCRYPT_SALT_ROUNDS,
};
