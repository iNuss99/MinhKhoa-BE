require('dotenv').config();

const MyConstants = {
  DB_SERVER: process.env.DB_SERVER || 'cluster0.dkdunxs.mongodb.net',
  DB_USER: process.env.DB_USER || '',
  DB_PASS: process.env.DB_PASS || '',
  DB_DATABASE: process.env.DB_DATABASE || 'shoppingonline',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  JWT_SECRET: process.env.JWT_SECRET || 'secret_jwt_key',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '86400000', // in milliseconds
};

module.exports = MyConstants;
