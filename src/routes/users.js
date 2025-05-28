export default async function (fastify) {
  fastify.get('/session/new', async function (request, reply) {
    return reply.view('user/login');
  });

  fastify.get('/users/new', async function (request, reply) {
    return reply.view('user/register');
  });
}
