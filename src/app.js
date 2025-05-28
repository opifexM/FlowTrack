import AutoLoad from '@fastify/autoload';
import cookie from '@fastify/cookie';
import view from '@fastify/view';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const options = {};

export default async function (fastify, opts) {
  fastify.register(cookie);

  fastify.register(view, {
    engine: { pug },
    root: path.join(__dirname, 'views'),
    includeViewExtension: true,
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
