import { NameExistsError, InUseError } from './label.error.js';
import { LabelModel } from './label.model.js';

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

    const foundLabels = await LabelModel.findAll(logger, db);
    logger.info({ count: foundLabels.length }, 'Listed all labels successfully');

    return foundLabels;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<Label|null>}
   */
  async getLabelById(log, db, id) {
    const logger = log.child({
      component: 'LabelService',
      method: 'getLabelById',
      id: id,
    });
    logger.info('Starting to retrieve Label by ID');

    const foundLabel = await LabelModel.findById(logger, db, id);
    logger.info({ labelId: foundLabel?.id }, 'Label retrieved by ID successfully');

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

    const foundLabel = await LabelModel.findByName(logger, db, name);
    logger.info('Label retrieved by Name successfully');

    return foundLabel;
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

    const existingLabel = await this.getLabelByName(logger, db, data.name);
    if (existingLabel) {
      logger.warn('Label with this name already exists');
      throw new NameExistsError(data.name);
    }

    const createdLabel = await LabelModel.create(logger, db, data);
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

    // todo inuse
    // const foundLabel = await LabelModel.findById(logger, db, inputId);
    // if (!foundLabel || foundLabel.id.toString() !== userId.toString()) {
    //   logger.warn('Couldn't delete the label it's in use');
    //   throw new InUseError();
    // }

    const deletedCount = await LabelModel.remove(logger, db, inputId);
    logger.info({ deletedCount: deletedCount }, 'Label deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {Partial<LabelCreateData>} data
   * @returns {Promise<Label|null>}
   */
  async updateLabel(log, db, inputId, data) {
    const logger = log.child({
      component: 'LabelService',
      method: 'updateLabel',
      inputId: inputId,
    });
    logger.info('Updating label');

    const existingLabel = await this.getLabelByName(logger, db, data.name);
    if (existingLabel && existingLabel.id.toString() !== inputId.toString()) {
      logger.warn('Label with this name already exists');
      throw new NameExistsError(data.name);
    }

    const updatedLabel = await LabelModel.update(logger, db, inputId, data);
    logger.info({ updatedLabelId: updatedLabel.id }, 'Label updated successfully');

    return updatedLabel;
  },
};
