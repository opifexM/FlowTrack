import fastifyFlash from '@fastify/flash';
import fp from 'fastify-plugin';

export default fp(
  async function (fastify, opts) {
    await fastify.register(fastifyFlash);
  },
  {
    name: 'flash',
    dependencies: ['cookie', 'secure-session'],
  },
);
