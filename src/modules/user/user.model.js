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

export const UserModel = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<User[]>}
   */
  async findAll(log, db) {
    const logger = log.child({
      component: 'UserModel',
      method: 'findAll',
    });
    logger.info('Starting to fetch all users from database');

    const users = await db('users').select('*');
    logger.info({ count: users.length }, 'Successfully fetched all users from database');

    return users;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(log, db, id) {
    const logger = log.child({
      component: 'UserModel',
      method: 'findById',
      userId: id,
    });
    logger.info('Starting to lookup user by ID in database');

    const user = await db('users').where({ id }).first();
    logger.info('User retrieved by ID from database successfully');

    return user;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(log, db, email) {
    const logger = log.child({
      component: 'UserModel',
      method: 'findByEmail',
      email: email,
    });
    logger.info('Starting to lookup user by Email in database');

    const user = await db('users').where({ email }).first();
    logger.info('User retrieved by Email from database successfully');

    return user;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {UserRegisterData} data
   * @returns {Promise<User>}
   */
  async create(log, db, data) {
    const logger = log.child({
      component: 'UserModel',
      method: 'create',
      email: data.email,
    });
    logger.info('Starting to insert new user into database');

    const [user] = await db('users')
      .insert(data)
      .returning('*');
    logger.info({ userId: user.id }, 'User inserted into database successfully');

    return user;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @param {Partial<UserRegisterData>} data
   * @returns {Promise<User|null>}
   */
  async update(log, db, id, data) {
    const logger = log.child({
      component: 'UserModel',
      method: 'update',
      userId: id,
    });
    logger.info('Starting to update user in database');

    const [user] = await db('users')
      .where({ id })
      .update(data)
      .returning('*');
    logger.info('User updated in database successfully');

    return user;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<number>} Number of deleted rows
   */
  async remove(log, db, id) {
    const logger = log.child({
      component: 'UserModel',
      method: 'remove',
      userId: id,
    });
    logger.info('Starting to delete user from database');

    const deletedCount = await db('users').where({ id }).del();
    logger.info({ deletedCount: deletedCount }, 'User deleted from database successfully');

    return deletedCount;
  },
};
