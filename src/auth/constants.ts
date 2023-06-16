import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};

export const bcryptConstants = {
  salt: process.env.BCRYPT_SALT,
};