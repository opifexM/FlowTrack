import fastifyFormbody from '@fastify/formbody';
import fp from 'fastify-plugin';
import qs from 'qs';

export default fp(
  async (fastify, opts) => {
    await fastify.register(fastifyFormbody, {
      parser: (payload) => qs.parse(payload),
    });
  },
  {
    name: 'formbody',
    dependencies: ['middie'],
  },
);
