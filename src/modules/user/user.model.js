import { Model } from 'objection';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 * @property {Date}   created_at
 * @property {Date}   updated_at
 */

/**
 * @typedef {Omit<User, 'password'>} SafeUser
 */

export default class UserModel extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }
};
