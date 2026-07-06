'use strict';
require('dotenv').config();

const required = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER',
  'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    accessSecret:   process.env.JWT_ACCESS_SECRET,
    refreshSecret:  process.env.JWT_REFRESH_SECRET,
    accessExpires:  process.env.JWT_ACCESS_EXPIRES  || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  
  emailFrom: process.env.EMAIL_FROM || '"GST Events" <noreply@gst.org>',

  frontendUrl:      process.env.FRONTEND_URL || 'http://localhost:5173',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
};
