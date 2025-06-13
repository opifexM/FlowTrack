import i18next from 'i18next';
import { taskCreateSchema } from '../modules/task/schemas/task-create.schema.js';
import { taskFilterSchema } from '../modules/task/schemas/task-filter-query.schema.js';
import { TaskController } from '../modules/task/task.controller.js';

const { t } = i18next;

export default async function tasksRoute(fastify) {
  fastify.get('/tasks', { preHandler: fastify.authenticate, schema: taskFilterSchema }, async (request, reply) => {
    request.log.info('GET /tasks');
    return TaskController.showTaskList(request, reply);
  });

  fastify.get('/tasks/new', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /tasks/new');
    return TaskController.showCreateForm(request, reply);
  });

  fastify.get('/tasks/:id/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /tasks/:id/edit');
    return TaskController.showEditForm(request, reply);
  });

  fastify.get('/tasks/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /tasks/:id');
    return TaskController.showTask(request, reply);
  });

  fastify.post('/tasks', {
    preHandler: fastify.authenticate,
    schema: taskCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('task-create.errors.general'));
      }
      return TaskController.showCreateForm(request, reply);
    },
  }, async (request, reply) => {
    request.log.info('POST /tasks');
    return TaskController.create(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/tasks/:id',
    preValidation: async (request, reply) => {
      // eslint-disable-next-line no-underscore-dangle
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /tasks/:id');
      // eslint-disable-next-line no-underscore-dangle
      if (request.body && request.body._method === 'patch') {
        request.log.info('PATCH /tasks/:id (OVERRIDE)');
        await fastify.authenticate(request, reply);

        return TaskController.update(request, reply);
      }
      // eslint-disable-next-line no-underscore-dangle
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /tasks/:id (OVERRIDE)');
        await fastify.authenticate(request, reply);

        return TaskController.delete(request, reply);
      }
      return undefined;
    },
    preHandler: fastify.authenticate,
    schema: taskCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('task-edit.errors.general'));
      }
      return TaskController.showEditForm(request, reply);
    },
    handler: async (request, reply) => {
      request.log.info('POST /tasks/:id (NO_OVERRIDE)');
      reply.code(400).send({ error: 'Method not supported' });
    },
  });

  fastify.patch('/tasks/:id', {
    preHandler: fastify.authenticate,
    schema: taskCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('task-edit.errors.general'));
      }
      return TaskController.showEditForm(request, reply);
    },
  }, async (request, reply) => {
    request.log.info('PATCH /tasks/:id');
    return TaskController.update(request, reply);
  });

  fastify.delete('/tasks/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('DELETE /tasks/:id');
    return TaskController.delete(request, reply);
  });
}
