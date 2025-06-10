import { Model } from 'objection';

/**
 * @typedef {Object} Label
 * @property {string} id
 * @property {string} name
 * @property {Date}   created_at
 * @property {Date}   updated_at
 */

export default class LabelModel extends Model {
  static get tableName() {
    return 'labels';
  }

  static get idColumn() {
    return 'id';
  }
};
