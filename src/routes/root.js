export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    fastify.log.info('handler "/" is called');

    return reply.view('index');
  });
}
