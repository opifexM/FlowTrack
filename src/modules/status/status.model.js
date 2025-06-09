import { Model } from 'objection';

/**
 * @typedef {Object} Status
 * @property {number} id
 * @property {string} name
 * @property {Date}   created_at
 * @property {Date}   updated_at
 */

export default class StatusModel extends Model {
  static get tableName() {
    return 'statuses';
  }

  static get idColumn() {
    return 'id';
  }
};
