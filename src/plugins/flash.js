import fastifyFlash from '@fastify/flash';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register(fastifyFlash);
  },
  {
    name: 'flash',
    dependencies: ['cookie', 'secure-session'],
  },
);
