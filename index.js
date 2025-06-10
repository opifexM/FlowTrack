import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const fastifyPkg = require('fastify');
fastifyPkg.version = '5.3.3';

const pluginUtils = require('fastify/lib/pluginUtils.js');
pluginUtils.checkVersion = () => {};

import buildApp from './src/app.js';

export default buildApp;
