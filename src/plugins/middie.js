import middie from '@fastify/middie';
import fp from 'fastify-plugin';

export default fp(
  async function (fastify, opts) {
    await fastify.register(middie);
  },
  {
    name: 'middie',
  },
);
