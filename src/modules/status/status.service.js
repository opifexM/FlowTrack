import { NameExistsError, InUseError } from './status.error.js';
import { StatusModel } from './status.model.js';

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

    const foundStatuses = await StatusModel.findAll(logger, db);
    logger.info({ count: foundStatuses.length }, 'Listed all statuses successfully');

    return foundStatuses;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Status|null>}
   */
  async getStatusById(log, db, id) {
    const logger = log.child({
      component: 'StatusService',
      method: 'getStatusById',
      id: id,
    });
    logger.info('Starting to retrieve Status by ID');

    const foundStatus = await StatusModel.findById(logger, db, id);
    logger.info({ statusId: foundStatus?.id }, 'Status retrieved by ID successfully');

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

    const foundStatus = await StatusModel.findByName(logger, db, name);
    logger.info('Status retrieved by Name successfully');

    return foundStatus;
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

    const existingStatus = await this.getStatusByName(logger, db, data.name);
    if (existingStatus) {
      logger.warn('Status with this name already exists');
      throw new NameExistsError(data.name);
    }

    const createdStatus = await StatusModel.create(logger, db, data);
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
      inputId: inputId,
    });
    logger.info('Deleting status');

    // todo inuse
    // const foundStatus = await StatusModel.findById(logger, db, inputId);
    // if (!foundStatus || foundStatus.id.toString() !== userId.toString()) {
    //   logger.warn('Couldn't delete the status it's in use');
    //   throw new InUseError();
    // }

    const deletedCount = await StatusModel.remove(logger, db, inputId);
    logger.info({ deletedCount: deletedCount }, 'Status deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {Partial<StatusCreateData>} data
   * @returns {Promise<Status|null>}
   */
  async updateStatus(log, db, inputId, data) {
    const logger = log.child({
      component: 'StatusService',
      method: 'updateStatus',
      inputId: inputId,
    });
    logger.info('Updating status');

    const existingStatus = await this.getStatusByName(logger, db, data.name);
    if (existingStatus && existingStatus.id.toString() !== inputId.toString()) {
      logger.warn('Status with this name already exists');
      throw new NameExistsError(data.name);
    }

    const updatedStatus = await StatusModel.update(logger, db, inputId, data);
    logger.info({ updatedStatusId: updatedStatus.id }, 'Status updated successfully');

    return updatedStatus;
  },
};
