import fastify from 'fastify';
import app from '../../src/app.js';
import LabelModel from '../../src/modules/label/label.model.js';
import StatusModel from '../../src/modules/status/status.model.js';
import TaskModel from '../../src/modules/task/task.model.js';
import UserModel from '../../src/modules/user/user.model.js';
import { UserService } from '../../src/modules/user/user.service.js';

export async function buildServer() {
  const server = fastify({
    exposeHeadRoutes: false,
    logger: { target: 'pino-pretty' },
  });
  await app(server);
  await server.objection.knex.migrate.latest();
  return server;
}

export function makeRequest(server) {
  return (opts) => server.inject(opts);
}

export function makeAuthRequest(server) {
  return async (opts, credentials) => {
    const res = await server.inject({
      method: 'POST',
      url: '/session',
      payload: { data: credentials },
    });
    const cookie = res.headers['set-cookie'];
    return server.inject({
      ...opts,
      headers: { cookie, ...opts.headers },
    });
  };
}

export async function clearUsers(server) {
  await server.objection.knex('users').del();
}

export async function clearLabels(server) {
  await server.objection.knex('labels').del();
}

export async function clearStatuses(server) {
  await server.objection.knex('statuses').del();
}

export async function clearTasks(server) {
  await server.objection.knex('task_labels').del();
  await server.objection.knex('tasks').del();
}

/**
 * @param {object} server
 * @param {User} user
 */
export async function insertUser(server, user) {
  const hashedPassword = UserService.createSHA(server.log, user.password);
  await UserModel.query(server.objection.knex).insert({ ...user, password: hashedPassword });
}

/**
 * @param {object} server
 * @param {Label} label
 */
export async function insertLabel(server, label) {
  await LabelModel.query(server.objection.knex).insert(label);
}

/**
 * @param {object} server
 * @param {Status} status
 */
export async function insertStatus(server, status) {
  await StatusModel.query(server.objection.knex).insert(status);
}

/**
 * @param {object} server
 * @param {Task} task
 */
export async function insertTask(server, task) {
  const { labelIds = [], ...taskData } = task;

  await server.objection.knex.transaction(async (trx) => {
    const createdTask = await TaskModel.query(trx).insert(taskData);

    if (labelIds.length) {
      await createdTask.$relatedQuery('labels', trx).relate(labelIds);
    }
  });
}
