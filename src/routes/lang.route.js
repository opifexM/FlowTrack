export default async function (fastify) {
  fastify.get('/lang/:lng', (request, reply) => {
    const { lng } = request.params;
    request.log.info('GET /lang');

    reply
      .setCookie('locale', lng, {
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      })
      .redirect(request.headers.referer || '/');
  });
}
