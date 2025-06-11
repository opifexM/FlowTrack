import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.setValidatorCompiler(({ schema }) => {
    if (schema && typeof schema.validate === 'function') {
      return async (data) => {
        const value = await schema.validate(data ?? {}, {
          abortEarly: false,
          stripUnknown: true,
        });
        return { value };
      };
    }
    return (data) => ({ value: data });
  });
}, {
  name: 'yup-schema',
});
