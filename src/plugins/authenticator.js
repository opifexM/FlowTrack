import fp from 'fastify-plugin';
import i18next from 'i18next';

const { t } = i18next;

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (req, reply) => {
    const userId = req.session.get('userId');
    if (!userId) {
      req.flash('danger', t('homepage.errors.forbidden'));
      return reply.redirect('/');
    }
    req.user = { id: userId };
    return undefined;
  });
}, {
  name: 'authenticator',
  dependencies: ['secure-session', 'flash'],
});
