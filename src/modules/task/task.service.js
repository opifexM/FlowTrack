import LabelModel from '../label/label.model.js';
import StatusModel from '../status/status.model.js';
import UserModel from '../user/user.model.js';
import { UserService } from '../user/user.service.js';
import { NameExistsError, NotFoundError } from './task.error.js';
import TaskModel from './task.model.js';

export const TaskService = {
  /**
   * @param {Task} task
   * @returns {Task}
   */
  sanitizeTask(task) {
    if (!task) return task;

    return {
      ...task,
      creator: UserService.sanitizeUser(task.creator),
      executor: UserService.sanitizeUser(task.executor),
    };
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {TaskFilterQuery} queryFilter
   * @param {string} userId
   * @returns {Promise<Task[]>}
   */
  async listTasks(log, db, queryFilter, userId) {
    const logger = log.child({
      component: 'TaskService',
      method: 'listTasks',
    });
    logger.info('Listing all tasks');

    const { status, executor, isCreatorUser, label } = queryFilter;

    /** @type {Task[]} */
    const foundTasks = await TaskModel.query(db)
      .modify('byStatus', status)
      .modify('byExecutor', executor)
      .modify('byCreator', isCreatorUser ? userId : null)
      .modify('byLabel', label);

    logger.info({ count: foundTasks.length }, 'Listed all tasks successfully');

    return foundTasks.map(task => this.sanitizeTask(task));
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Task>}
   */
  async getTaskById(log, db, id) {
    const logger = log.child({
      component: 'TaskService',
      method: 'getTaskById',
      id: id,
    });
    logger.info('Starting to retrieve Task by ID');

    /** @type {Task|undefined} */
    const foundTask = await TaskModel.query(db).findById(id);
    if (!foundTask) {
      logger.warn('Task not found');
      throw new NotFoundError(id);
    }
    logger.info({ taskId: foundTask.id }, 'Task retrieved by ID successfully');

    return this.sanitizeTask(foundTask);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} name
   * @returns {Promise<Task|null>}
   */
  async getTaskByName(log, db, name) {
    const logger = log.child({
      component: 'TaskService',
      method: 'getTaskByName',
    });
    logger.info('Starting to retrieve Task by Name');

    /** @type {Task|undefined} */
    const foundTask = await TaskModel.query(db).findOne({ name });
    logger.info('Task retrieved by Name successfully');

    return foundTask || null;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} userId
   * @param {TaskCreateData} data
   * @returns {Promise<Task>}
   */
  async createTask(log, db, userId, data) {
    const logger = log.child({
      component: 'TaskService',
      method: 'createTask',
    });
    logger.info('Creating new task');

    /** @type {Task|null} */
    const existingTask = await this.getTaskByName(logger, db, data.name);
    if (existingTask) {
      logger.warn('Task with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Task} */
    const createdTask = await TaskModel.transaction(db, async (trx) => {
      return TaskModel.query(trx)
        .insertGraphAndFetch({
          ...data,
          creatorId: userId,
          labels: data.labels?.map(id => LabelModel.fromJson({ id })) || [],
        }, {
          relate: true,
          unrelate: false,
          allowRefs: true,
        });
    });

    logger.info({ taskId: createdTask.id }, 'Task created successfully');
    return this.sanitizeTask(createdTask);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @returns {Promise<number>}
   */
  async deleteTask(log, db, inputId) {
    const logger = log.child({
      component: 'TaskService',
      method: 'deleteTask',
      inputId: inputId,
    });
    logger.info('Deleting task');

    /** @type {Task|undefined} */
    const foundTask = await TaskModel.query(db).findById(inputId);
    if (!foundTask) {
      logger.warn('Task not found for delete');
      throw new NotFoundError(inputId);
    }

    /** @type {number} */
    const deletedCount = await TaskModel.query(db).deleteById(inputId);
    logger.info({ deletedCount: deletedCount }, 'Task deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @param {Partial<TaskCreateData>} data
   * @returns {Promise<Task>}
   */
  async updateTask(log, db, inputId, userId, data) {
    const logger = log.child({
      component: 'TaskService',
      method: 'updateTask',
      inputId: inputId,
    });
    logger.info('Updating task');

    /** @type {Task|undefined} */
    const foundTask = await TaskModel.query(db).findById(inputId);
    if (!foundTask) {
      logger.warn('Task not found for update');
      throw new NotFoundError(inputId);
    }

    /** @type {Task|null} */
    const existingTask = await this.getTaskByName(logger, db, data.name);
    if (existingTask && existingTask.id.toString() !== inputId.toString()) {
      logger.warn('Task with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Task} */
    const updatedTask = await TaskModel.transaction(db, async (trx) => {
      return TaskModel.query(trx)
        .upsertGraphAndFetch({
          ...data,
          id: inputId,
          creatorId: userId,
          labels: data.labels?.map(id => LabelModel.fromJson({ id })) || [],
        }, {
          relate: true,
          unrelate: true,
          update: true,
          allowRefs: true,
        });
    });

    logger.info({ taskId: updatedTask.id }, 'Task updated successfully');
    return this.sanitizeTask(updatedTask);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<{
   *      statuses: Status[],
   *      users: User[],
   *      labels: Label[]
   *    }>
   *  }
   */
  async getTaskOptions(log, db) {
    const logger = log.child({
      component: 'TaskService',
      method: 'getTaskOptions',
    });
    logger.info('Fetching task options (statuses, users, labels)');

    const [statuses, users, labels] = await Promise.all([
      /** @type {Promise<Status[]>} */
      StatusModel.query(db).orderBy('name'),
      /** @type {Promise<User[]>} */
      UserModel.query(db).orderBy('lastName'),
      /** @type {Promise<Label[]>} */
      LabelModel.query(db).orderBy('name'),
    ]);
    logger.info({ statuses: statuses.length, users: users.length, labels: labels.length }, 'Task options fetched');

    return {
      statuses,
      users: users.map(user => UserService.sanitizeUser(user)),
      labels,
    };
  },
};
