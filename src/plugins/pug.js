import view from '@fastify/view';
import fp from 'fastify-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async (fastify, opts) => {
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
