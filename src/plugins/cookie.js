import fastifyCookie from '@fastify/cookie';
import fp from 'fastify-plugin';

export default fp(
  async function (fastify, opts) {
    await fastify.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
      parseOptions: {},
    });
  },
  {
    name: 'cookie',
  },
);
