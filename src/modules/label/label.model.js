/**
 * @typedef {Object} Label
 * @property {number} id
 * @property {string} name
 * @property {Date}   created_at
 * @property {Date}   updated_at
 */

export const LabelModel = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<Label[]>}
   */
  async findAll(log, db) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'findAll',
    });
    logger.info('Starting to fetch all Labels from database');

    const labels = await db('labels').select('*');
    logger.info({ count: labels.length }, 'Successfully fetched all Labels from database');

    return labels;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Label|null>}
   */
  async findById(log, db, id) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'findById',
      labelId: id,
    });
    logger.info('Starting to lookup Label by ID in database');

    const label = await db('labels').where({ id }).first();
    logger.info('Label retrieved by ID from database successfully');

    return label;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} name
   * @returns {Promise<Label|null>}
   */
  async findByName(log, db, name) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'findByName',
      name: name,
    });
    logger.info('Starting to lookup Label by Name in database');

    const label = await db('labels').where({ name }).first();
    logger.info('Label retrieved by Name from database successfully');

    return label;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {LabelCreateData} data
   * @returns {Promise<Label>}
   */
  async create(log, db, data) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'create',
    });
    logger.info('Starting to insert new Label into database');

    const [label] = await db('labels')
      .insert(data)
      .returning('*');
    logger.info({ labelId: label.id }, 'Label inserted into database successfully');

    return label;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @param {Partial<LabelCreateData>} data
   * @returns {Promise<Label|null>}
   */
  async update(log, db, id, data) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'update',
      labelId: id,
    });
    logger.info('Starting to update Label in database');

    const [label] = await db('labels')
      .where({ id })
      .update(data)
      .returning('*');
    logger.info('Label updated in database successfully');

    return label;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<number>} Number of deleted rows
   */
  async remove(log, db, id) {
    const logger = log.child({
      component: 'LabelModel',
      method: 'remove',
      labelId: id,
    });
    logger.info('Starting to delete Label from database');

    const deletedCount = await db('labels').where({ id }).del();
    logger.info({ deletedCount: deletedCount }, 'Label deleted from database successfully');

    return deletedCount;
  },
};
