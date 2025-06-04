import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error.name === 'ValidationError') {
      const details = error.inner?.length
        ? error.inner.map(e => `${e.path}: ${e.message}`)
        : [error.message];

      request.flash('warning', details);
      return reply.redirect(request.raw.headers.referer || '/');
    }

    request.log.error(error);
    reply.send(error);
  });
}, {
  name: 'schema-handler',
  dependencies: ['yup-schema', 'flash'],
});
