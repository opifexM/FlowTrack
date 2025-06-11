import cors from '@fastify/cors';
import fp from 'fastify-plugin';

export default fp(
  async (fastify, opts) => {
    await fastify.register(cors);
  },
  {
    name: 'cors',
  },
);
