import fp from 'fastify-plugin';
import knex from 'knex';
import knexConfig from '../../knexfile.js';

export default fp(
  async (fastify, opts) => {
    const env = process.env.ENVIRONMENT === 'development'
      ? 'development'
      : 'production';

    const db = knex(knexConfig[env]);

    fastify.addHook('onClose', async (instance, done) => {
      await db.destroy();
      done();
    });

    fastify.decorate('knex', db);
  },
  {
    name: 'knex',
  },
);
