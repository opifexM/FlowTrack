import TaskModel from '../task/task.model.js';
import { InUseError, NameExistsError, NotFoundError } from './status.error.js';
import StatusModel from './status.model.js';

export const StatusService = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<Status[]>}
   */
  async listStatuses(log, db) {
    const logger = log.child({
      component: 'StatusService',
      method: 'listStatuses',
    });
    logger.info('Listing all statuses');

    /** @type {Status[]} */
    const foundStatuses = await StatusModel.query(db).select();
    logger.info({ count: foundStatuses.length }, 'Listed all statuses successfully');

    return foundStatuses;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Status>}
   */
  async getStatusById(log, db, id) {
    const logger = log.child({
      component: 'StatusService',
      method: 'getStatusById',
      id,
    });
    logger.info('Starting to retrieve Status by ID');

    /** @type {Status|undefined} */
    const foundStatus = await StatusModel.query(db).findById(id);
    if (!foundStatus) {
      logger.warn('Status not found');
      throw new NotFoundError(id);
    }
    logger.info({ statusId: foundStatus.id }, 'Status retrieved by ID successfully');

    return foundStatus;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} name
   * @returns {Promise<Status|null>}
   */
  async getStatusByName(log, db, name) {
    const logger = log.child({
      component: 'StatusService',
      method: 'getStatusByName',
    });
    logger.info('Starting to retrieve Status by Name');

    /** @type {Status|undefined} */
    const foundStatus = await StatusModel.query(db).findOne({ name });
    logger.info('Status retrieved by Name successfully');

    return foundStatus || null;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {StatusCreateData} data
   * @returns {Promise<Status>}
   */
  async createStatus(log, db, data) {
    const logger = log.child({
      component: 'StatusService',
      method: 'createStatus',
    });
    logger.info('Creating new status');

    /** @type {Status|undefined} */
    const existingStatus = await this.getStatusByName(logger, db, data.name);
    if (existingStatus) {
      logger.warn('Status with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Status} */
    const createdStatus = await StatusModel
      .query(db)
      .insert(data)
      .returning('*');

    logger.info({ statusId: createdStatus.id }, 'Status created successfully');

    return createdStatus;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @returns {Promise<number>}
   */
  async deleteStatus(log, db, inputId) {
    const logger = log.child({
      component: 'StatusService',
      method: 'deleteStatus',
      inputId,
    });
    logger.info('Deleting status');

    /** @type {Status|undefined} */
    const foundStatus = await StatusModel.query(db).findById(inputId);
    if (!foundStatus) {
      logger.warn('Status not found for delete');
      throw new NotFoundError(inputId);
    }

    const inUseCount = await TaskModel.query(db)
      .where('statusId', inputId)
      .resultSize();
    if (inUseCount > 0) {
      logger.warn({ inUseCount }, 'Cannot delete status: still referenced in tasks');
      throw new InUseError();
    }

    /** @type {number} */
    const deletedCount = await StatusModel.query(db).deleteById(inputId);
    logger.info({ deletedCount }, 'Status deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {Partial<StatusCreateData>} data
   * @returns {Promise<Status>}
   */
  async updateStatus(log, db, inputId, data) {
    const logger = log.child({
      component: 'StatusService',
      method: 'updateStatus',
      inputId,
    });
    logger.info('Updating status');

    /** @type {Status|undefined} */
    const foundStatus = await StatusModel.query(db).findById(inputId);
    if (!foundStatus) {
      logger.warn('Status not found for update');
      throw new NotFoundError(inputId);
    }

    /** @type {Status|undefined} */
    const existingStatus = await this.getStatusByName(logger, db, data.name);
    if (existingStatus && existingStatus.id.toString() !== inputId.toString()) {
      logger.warn('Status with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Status} */
    const updatedStatus = await StatusModel.query(db).patchAndFetchById(inputId, data);
    logger.info({ updatedStatusId: updatedStatus.id }, 'Status updated successfully');

    return updatedStatus;
  },
};
