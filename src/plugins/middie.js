import middie from '@fastify/middie';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register(middie);
  },
  {
    name: 'middie',
  },
);
