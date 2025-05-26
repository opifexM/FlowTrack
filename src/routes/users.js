export default async function (fastify) {
  fastify.get('/users', async () => {
    return [{ id: 1, name: 'Alice' }];
  });
}
