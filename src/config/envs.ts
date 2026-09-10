import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  port: env.get('PORT').default(3000).asPortNumber(),

  dbHost: env.get('DB_HOST').required().asString(),
  dbPort: env.get('DB_PORT').required().asPortNumber(),
  dbUser: env.get('DB_USER').required().asString(),
  dbPassword: env.get('DB_PASSWORD').required().asString(),
  dbName: env.get('DB_NAME').required().asString(),

  jwtSecret: env.get('JWT_SECRET').required().asString(),
  jwtExpiration: env.get('JWT_EXPIRATION').required().asString(),

  smtpHost: env.get('SMTP_HOST').required().asString(),
  smtpPort: env.get('SMTP_PORT').required().asPortNumber(),
  smtpUser: env.get('SMTP_USER').required().asString(),
  smtpPass: env.get('SMTP_PASS').required().asString(),
  smtpFrom: env.get('SMTP_FROM').required().asString(),

  mailCrewAddress: env.get('MAIL_CREW_ADDRESS').required().asEmailString(),
};
