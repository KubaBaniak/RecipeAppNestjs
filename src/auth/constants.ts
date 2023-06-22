import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};

export const bcryptConstants = {
  salt: Number(process.env.BCRYPT_SALT_ROUNDS),
};
