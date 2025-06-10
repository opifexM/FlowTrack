import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pluginUtils = require('fastify/lib/pluginUtils.js');

pluginUtils.checkVersion = () => {};
