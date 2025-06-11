import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.addHook('onError', (request, reply, error, done) => {
    if (error.name === 'ValidationError') {
      const details = (error.inner.length ? error.inner : [error]).map(({ path, message }) => {
        const field = path?.split('.').pop() || path || 'form';
        return { field, message };
      });
      request.flash('invalid', details);
    }
    done();
  });
}, {
  name: 'schema-handler',
  dependencies: ['yup-schema', 'flash'],
});
