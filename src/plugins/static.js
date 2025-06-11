import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';
import path from 'node:path';

export default fp(
  async (fastify, opts) => {
    await fastify.register(fastifyStatic, {
      root: path.join(process.cwd(), 'public'),
      prefix: '/',
    });
  },
  {
    name: 'static',
  },
);
