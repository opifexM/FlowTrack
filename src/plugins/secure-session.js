import fp from 'fastify-plugin';
import secureSession from '@fastify/secure-session';

export default fp(async (fastify, opts) => {
  await fastify.register(secureSession, {
    key: Buffer.from(process.env.SECURE_SESSION_SECRET, 'base64'),
    cookie: {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
  });
}, {
  name: 'secure-session',
  dependencies: ['cookie'],
});
