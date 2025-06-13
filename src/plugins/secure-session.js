import secureSession from '@fastify/secure-session';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
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
