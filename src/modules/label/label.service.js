import { InUseError, NameExistsError, NotFoundError } from './label.error.js';
import LabelModel from './label.model.js';

export const LabelService = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<Label[]>}
   */
  async listLabels(log, db) {
    const logger = log.child({
      component: 'LabelService',
      method: 'listLabels',
    });
    logger.info('Listing all labels');

    /** @type {Label[]} */
    const foundLabels = await LabelModel.query(db).select();
    logger.info({ count: foundLabels.length }, 'Listed all labels successfully');

    return foundLabels;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Label>}
   */
  async getLabelById(log, db, id) {
    const logger = log.child({
      component: 'LabelService',
      method: 'getLabelById',
      id: id,
    });
    logger.info('Starting to retrieve Label by ID');

    /** @type {Label|undefined} */
    const foundLabel = await LabelModel.query(db).findById(id);
    if (!foundLabel) {
      logger.warn('Label not found');
      throw new NotFoundError(id);
    }
    logger.info({ labelId: foundLabel.id }, 'Label retrieved by ID successfully');

    return foundLabel;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} name
   * @returns {Promise<Label|null>}
   */
  async getLabelByName(log, db, name) {
    const logger = log.child({
      component: 'LabelService',
      method: 'getLabelByName',
    });
    logger.info('Starting to retrieve Label by Name');

    /** @type {Label|undefined} */
    const foundLabel = await LabelModel.query(db).findOne({ name });
    logger.info('Label retrieved by Name successfully');

    return foundLabel || null;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {LabelCreateData} data
   * @returns {Promise<Label>}
   */
  async createLabel(log, db, data) {
    const logger = log.child({
      component: 'LabelService',
      method: 'createLabel',
    });
    logger.info('Creating new label');

    /** @type {Label|null} */
    const existingLabel = await LabelService.getLabelByName(logger, db, data.name);
    if (existingLabel) {
      logger.warn('Label with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Label} */
    const createdLabel = await LabelModel
      .query(db)
      .insert(data)
      .returning('*');

    logger.info({ labelId: createdLabel.id }, 'Label created successfully');

    return createdLabel;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @returns {Promise<number>}
   */
  async deleteLabel(log, db, inputId) {
    const logger = log.child({
      component: 'LabelService',
      method: 'deleteLabel',
      inputId: inputId,
    });
    logger.info('Deleting label');

    /** @type {Label|undefined} */
    const foundLabel = await LabelModel.query(db).findById(inputId);
    if (!foundLabel) {
      logger.warn('Label not found for delete');
      throw new NotFoundError(inputId);
    }

    const inUseCount = await LabelModel
      .relatedQuery('tasks', db)
      .for(inputId)
      .resultSize();
    if (inUseCount > 0) {
      logger.warn({ inUseCount }, 'Cannot delete label: still referenced in tasks');
      throw new InUseError(`Label ${inputId} is still used in ${inUseCount} task(s)`);
    }

    /** @type {number} */
    const deletedCount = await LabelModel.query(db).deleteById(inputId);
    logger.info({ deletedCount: deletedCount }, 'Label deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {Partial<LabelCreateData>} data
   * @returns {Promise<Label>}
   */
  async updateLabel(log, db, inputId, data) {
    const logger = log.child({
      component: 'LabelService',
      method: 'updateLabel',
      inputId: inputId,
    });
    logger.info('Updating label');

    /** @type {Label|undefined} */
    const foundLabel = await LabelModel.query(db).findById(inputId);
    if (!foundLabel) {
      logger.warn('Label not found for update');
      throw new NotFoundError(inputId);
    }

    /** @type {Label|null} */
    const existingLabel = await this.getLabelByName(logger, db, data.name);
    if (existingLabel && existingLabel.id.toString() !== inputId.toString()) {
      logger.warn('Label with this name already exists');
      throw new NameExistsError(data.name);
    }

    /** @type {Label} */
    logger.info({ updatedLabelId: updatedLabel.id }, 'Label updated successfully');

    return updatedLabel;
  },
};
