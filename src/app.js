import AutoLoad from '@fastify/autoload';
import { createRequire } from 'module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pluginUtils = require('fastify/lib/pluginUtils.js');
pluginUtils.checkVersion = () => {};

export default async function (fastify, opts) {
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
