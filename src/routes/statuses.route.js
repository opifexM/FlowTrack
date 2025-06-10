import { statusCreateSchema } from '../modules/status/schemas/status-create.schema.js';
import { StatusController } from '../modules/status/status.controller.js';

export default async function (fastify) {
  fastify.get('/statuses', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /statuses');
    return StatusController.showStatusList(request, reply);
  });

  fastify.get('/statuses/new', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /statuses/new');
    return StatusController.showCreateForm(request, reply);
  });

  fastify.get('/statuses/:id/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /statuses/:id/edit');
    return StatusController.showEditForm(request, reply);
  });

  fastify.post('/statuses', { preHandler: fastify.authenticate, schema: statusCreateSchema }, async (request, reply) => {
    request.log.info('POST /statuses');
    return StatusController.create(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/statuses/:id',
    preValidation: async (request, reply) => {
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /statuses/:id');
      if (request.body && request.body._method === 'patch') {
        request.log.info('PATCH /statuses/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);
        await statusCreateSchema.body.validate(request.body);

        return StatusController.update(request, reply);
      }
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /statuses/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);

        return StatusController.delete(request, reply);
      }
    },
    preHandler: fastify.authenticate,
    schema: statusCreateSchema,
    handler: async (request, reply) => {
      request.log.info('POST /statuses/:id (NO_OVERRIDE)');
      reply.code(400).send({ error: 'Method not supported' });
    },
  });

  fastify.patch('/statuses/:id', { preHandler: fastify.authenticate, schema: statusCreateSchema }, async (request, reply) => {
    request.log.info('PATCH /statuses/:id');
    return StatusController.update(request, reply);
  });

  fastify.delete('/statuses/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('DELETE /statuses/:id');
    return StatusController.delete(request, reply);
  });
}
