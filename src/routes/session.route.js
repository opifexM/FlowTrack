import i18next from 'i18next';
import { userLoginSchema } from '../modules/user/schemas/user-login.schema.js';
import { UserController } from '../modules/user/user.controller.js';

const { t } = i18next;

export default async function sessionRoute(fastify) {
  fastify.get('/session/new', async (request, reply) => {
    request.log.info('GET /session/new');
    return UserController.showLoginForm(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/session',
    preValidation: async (request, reply) => {
      // eslint-disable-next-line no-underscore-dangle
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /session');
      // eslint-disable-next-line no-underscore-dangle
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /session (OVERRIDE)');

        return UserController.logout(request, reply);
      }
      return undefined;
    },
    schema: userLoginSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('user-login.errors.general'));
      }
      return UserController.showLoginForm(request, reply);
    },
    handler: async (request, reply) => {
      request.log.info('POST /session (NO_OVERRIDE)');

      return UserController.login(request, reply);
    },
  });

  fastify.delete('/session', async (request, reply) => {
    request.log.info('DELETE /session');
    return UserController.logout(request, reply);
  });
}
