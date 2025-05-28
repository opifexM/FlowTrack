import fp from 'fastify-plugin';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default fp(async (fastify) => {
  await i18next
    .use(Backend)
    .init({
      debug: true,
      supportedLngs: ['ru', 'en'],
      fallbackLng: 'ru',
      preload: ['ru', 'en'],
      backend: {
        loadPath: join(__dirname, '..', 'locales', '{{lng}}.json'),
      },
      interpolation: { escapeValue: false },
    });

  fastify.addHook('onRequest', (req, reply, done) => {
    const lang = req.cookies.locale || i18next.options.fallbackLng;
    const t = i18next.getFixedT(lang);
    req.t = t;
    reply.locals = { __: t, locale: lang };
    done();
  });
});
