import fp from 'fastify-plugin';
import view from '@fastify/view';
import pug from 'pug';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async function (fastify, opts) {
  await fastify.register(view, {
    engine: {
      pug,
    },
    root: path.join(__dirname, '../views'),
    includeViewExtension: true,
  });
}, {
  name: 'pug',
});
