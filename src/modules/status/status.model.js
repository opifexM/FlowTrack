/**
 * @typedef {Object} Status
 * @property {number} id
 * @property {string} name
 * @property {Date}   created_at
 * @property {Date}   updated_at
 */

export const StatusModel = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<Status[]>}
   */
  async findAll(log, db) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'findAll',
    });
    logger.info('Starting to fetch all Statuses from database');

    const statuses = await db('statuses').select('*');
    logger.info({ count: statuses.length }, 'Successfully fetched all Statuses from database');

    return statuses;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Status|null>}
   */
  async findById(log, db, id) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'findById',
      statusId: id,
    });
    logger.info('Starting to lookup Status by ID in database');

    const status = await db('statuses').where({ id }).first();
    logger.info('Status retrieved by ID from database successfully');

    return status;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} name
   * @returns {Promise<Status|null>}
   */
  async findByName(log, db, name) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'findByName',
      name: name,
    });
    logger.info('Starting to lookup Status by Name in database');

    const status = await db('statuses').where({ name }).first();
    logger.info('Status retrieved by Name from database successfully');

    return status;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {StatusCreateData} data
   * @returns {Promise<Status>}
   */
  async create(log, db, data) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'create',
    });
    logger.info('Starting to insert new Status into database');

    const [status] = await db('statuses')
      .insert(data)
      .returning('*');
    logger.info({ statusId: status.id }, 'Status inserted into database successfully');

    return status;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @param {Partial<StatusCreateData>} data
   * @returns {Promise<Status|null>}
   */
  async update(log, db, id, data) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'update',
      statusId: id,
    });
    logger.info('Starting to update Status in database');

    const [status] = await db('statuses')
      .where({ id })
      .update(data)
      .returning('*');
    logger.info('Status updated in database successfully');

    return status;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<number>} Number of deleted rows
   */
  async remove(log, db, id) {
    const logger = log.child({
      component: 'StatusModel',
      method: 'remove',
      statusId: id,
    });
    logger.info('Starting to delete Status from database');

    const deletedCount = await db('statuses').where({ id }).del();
    logger.info({ deletedCount: deletedCount }, 'Status deleted from database successfully');

    return deletedCount;
  },
};
