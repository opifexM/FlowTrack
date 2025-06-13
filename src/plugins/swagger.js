import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export default fp(
  async (fastify) => {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'FlowTrack API',
          version: '1.0.0',
        },
      },
      exposeRoute: true,
      routePrefix: '/docs',
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
    });
  },
  {
    name: 'swagger',
  },
);
