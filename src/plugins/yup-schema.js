import fp from 'fastify-plugin';
import { fastifyYupSchema } from 'fastify-yup-schema';

export default fp(
  async function (fastify, opts) {
    await fastify.register(fastifyYupSchema, {
      validationOptions: {
        abortEarly: false,
        stripUnknown: true,
      },
    });

    fastify.addHook('preValidation', async (request, reply) => {
      const schema = request.context?.config?.schema;
      if (!schema) {
        return;
      }

      if (schema.body) {
        request.body = await schema.body.validate(request.body ?? {}, {
          stripUnknown: true,
          abortEarly: false,
        });
      }

      if (schema.querystring) {
        request.query = await schema.querystring.validate(request.query ?? {}, {
          stripUnknown: true,
          abortEarly: false,
        });
      }
    });
  },
  {
    name: 'yup-schema',
  },
);
