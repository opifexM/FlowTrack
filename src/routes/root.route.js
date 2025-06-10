import { RootController } from '../modules/root.controller.js';

export default async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    request.log.info('GET /');
    return RootController.showMainPage(request, reply);
  });
}
