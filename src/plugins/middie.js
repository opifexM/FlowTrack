import fp from 'fastify-plugin';
import middie from '@fastify/middie';

export default fp(
  async function (fastify, opts) {
    await fastify.register(middie);
  },
  {
    name: 'middie',
  },
);
