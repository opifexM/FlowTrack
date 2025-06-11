import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error.name === 'ValidationError') {
      const details = (error.inner.length ? error.inner : [error]).map(({ path, message }) => {
        const field = path?.split('.').pop() || path || 'form';
        return { field, message };
      });
      request.flash('invalid', details);
      throw error;
    }
    request.log.error(error);
    reply.send(error);
  });
}, {
  name: 'schema-handler',
  dependencies: ['yup-schema', 'flash'],
});
