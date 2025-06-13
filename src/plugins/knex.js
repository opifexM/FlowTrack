import fp from 'fastify-plugin';
import knex from 'knex';
import { Model } from 'objection';
import knexConfig from '../../knexfile.js';

export default fp(
  async (fastify) => {
    const env = process.env.ENVIRONMENT === 'development'
      ? 'development'
      : 'production';

    fastify.log.info(`DB configuration: ${env}`);
    const db = knex(knexConfig[env]);
    Model.knex(db);

    fastify.addHook('onClose', async (instance, done) => {
      await db.destroy();
      done();
    });

    fastify.decorate('knex', db);
    fastify.decorate('Model', Model);
    fastify.decorate('objection', {
      knex: db,
      Model,
    });
  },
  {
    name: 'knex',
  },
);
