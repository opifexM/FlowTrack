import i18next from 'i18next';
import { LabelController } from '../modules/label/label.controller.js';
import { labelCreateSchema } from '../modules/label/schemas/label-create.schema.js';

const { t } = i18next;

export default async function (fastify) {
  fastify.get('/labels', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /labels');
    return LabelController.showLabelList(request, reply);
  });

  fastify.get('/labels/new', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /labels/new');
    return LabelController.showCreateForm(request, reply);
  });

  fastify.get('/labels/:id/edit', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('GET /labels/:id/edit');
    return LabelController.showEditForm(request, reply);
  });

  fastify.post('/labels', {
    preHandler: fastify.authenticate,
    schema: labelCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('label-create.errors.general'));
      }
      return LabelController.showCreateForm(request, reply);
    },
  }, async (request, reply) => {
    request.log.info('POST /labels');
    return LabelController.create(request, reply);
  });

  fastify.route({
    method: 'POST',
    url: '/labels/:id',
    preValidation: async (request, reply) => {
      request.log.info({ body: request.body?._method }, 'PREVALIDATION POST /labels/:id');
      if (request.body && request.body._method === 'patch') {
        request.log.info('PATCH /labels/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);
        await labelCreateSchema.body.validate(request.body);

        return LabelController.update(request, reply);
      }
      if (request.body && request.body._method === 'delete') {
        request.log.info('DELETE /labels/:id (OVERRIDE)');

        await fastify.authenticate(request, reply);

        return LabelController.delete(request, reply);
      }
    },
    preHandler: fastify.authenticate,
    schema: labelCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('label-edit.errors.general'));
      }
      return LabelController.showEditForm(request, reply);
    },
    handler: async (request, reply) => {
      request.log.info('POST /labels/:id (NO_OVERRIDE)');
      reply.code(400).send({ error: 'Method not supported' });
    },
  });

  fastify.patch('/labels/:id', {
    preHandler: fastify.authenticate,
    schema: labelCreateSchema,
    errorHandler: async (error, request, reply) => {
      if (error.name === 'ValidationError') {
        request.flash('danger', t('label-edit.errors.general'));
      }
      return LabelController.showEditForm(request, reply);
    },
  }, async (request, reply) => {
    request.log.info('PATCH /labels/:id');
    return LabelController.update(request, reply);
  });

  fastify.delete('/labels/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    request.log.info('DELETE /labels/:id');
    return LabelController.delete(request, reply);
  });
}
