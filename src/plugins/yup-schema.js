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
  },
  {
    name: 'yup-schema',
  },
);
