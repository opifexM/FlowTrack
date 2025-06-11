import fp from 'fastify-plugin';
import i18next from 'i18next';

const { t } = i18next;

export default fp(async (fastify, opts) => {
  fastify.decorate('authenticate', async (request, reply) => {
    const userId = request.session.get('userId');
    if (!userId) {
      request.flash('danger', t('homepage.errors.forbidden'));
      return reply.redirect('/');
    }
    request.user = { id: userId };
  });
}, {
  name: 'authenticator',
  dependencies: ['secure-session', 'flash'],
});
