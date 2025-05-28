import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export default fp(async function (fastify, opts) {
  fastify.register(swagger, {
    openapi: {
      info: {
        title: 'FlowTrack API',
        version: '1.0.0',
      },
    },
    exposeRoute: true,
    routePrefix: '/docs',
  });

  fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });
});
