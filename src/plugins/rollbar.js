import fp from 'fastify-plugin';
import Rollbar from 'rollbar';

export default fp(async (fastify) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  fastify.decorate('rollbar', rollbar);
  fastify.addHook('onError', async (request, reply, error) => {
    rollbar.error(error, request);
  });
}, {
  name: 'rollbar',
});
