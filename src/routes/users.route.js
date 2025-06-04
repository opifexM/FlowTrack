import { userRegisterSchema } from '../modules/user/schemas/user-register.schema.js';
import { UserController } from '../modules/user/user.controller.js';

export default async function (fastify) {
  fastify.get('/users', async (request, reply) => {
    request.log.info('GET /users');
    return UserController.showUserList(request, reply);
  });

  fastify.get('/users/new', async (request, reply) => {
    request.log.info('GET /users/new');
    return UserController.showRegisterForm(request, reply);
  });

  fastify.get('/users/:id/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /users/:id/edit');
    return UserController.showEditForm(request, reply);
  });

  fastify.post('/users', { schema: userRegisterSchema }, async (request, reply) => {
    request.log.info('POST /users');
    return UserController.register(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/users/:id',
    preValidation: async (request, reply) => {
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /users/:id');
      if (request.body && request.body._method === 'patch') {
        request.log.info('PATCH /users/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);
        await userRegisterSchema.body.validate(request.body);

        return UserController.update(request, reply);
      }
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /users/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);

        return UserController.delete(request, reply);
      }
    },
    preHandler: fastify.authenticate,
    schema: userRegisterSchema,
    handler: async (request, reply) => {
      request.log.info('POST /users/:id (NO_OVERRIDE)');
      reply.code(400).send({ error: 'Method not supported' });
    },
  });

  fastify.patch('/users/:id', { preHandler: fastify.authenticate, schema: userRegisterSchema }, async (request, reply) => {
    request.log.info('PATCH /users/:id');
    return UserController.update(request, reply);
  });

  fastify.delete('/users/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('DELETE /users/:id');
    return UserController.delete(request, reply);
  });
}
