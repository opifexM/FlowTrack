import { userLoginSchema } from '../modules/user/schemas/user-login.schema.js';
import { UserController } from '../modules/user/user.controller.js';

export default async function (fastify) {
  fastify.get('/session/new', async (request, reply) => {
    request.log.info('GET /session/new');
    return UserController.showLoginForm(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/session',
    preValidation: async (request, reply) => {
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /session');
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /session (OVERRIDE)');

        return UserController.logout(request, reply);
      }
    },
    schema: userLoginSchema,
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
