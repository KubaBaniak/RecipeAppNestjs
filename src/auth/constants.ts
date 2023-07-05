import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};

export const bcryptConstants = {
  salt: +process.env.BCRYPT_SALT_ROUNDS,
  test_salt: +process.env.BCRYPT_SALT_ROUNDS_TEST,
};
