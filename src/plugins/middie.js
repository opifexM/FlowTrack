import middie from '@fastify/middie';
import fp from 'fastify-plugin';

export default fp(
  async (fastify, opts) => {
    await fastify.register(middie);
  },
  {
    name: 'middie',
  },
);
