import dotenv from 'dotenv';
import fp from 'fastify-plugin';

dotenv.config();

export default fp(
  async (fastify) => {
    const requiredEnvVars = [
      'ENVIRONMENT',
      'PG_HOST',
      'PG_PORT',
      'PG_USER',
      'PG_PASSWORD',
      'PG_DATABASE',
      'COOKIE_SECRET',
      'SECURE_SESSION_SECRET',
      'PASSWORD_ALGORITHM',
      'PASSWORD_SALT_SECRET',
    ];

    const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    fastify.log.info('All required environment variables loaded successfully');
    fastify.decorate('env', process.env);
  },
  {
    name: 'dotenv',
  },
);
