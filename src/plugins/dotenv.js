import dotenv from 'dotenv'
import fp from 'fastify-plugin'

dotenv.config();

export default fp(async function (fastify, opts) {
  fastify.decorate('env', process.env)
})
