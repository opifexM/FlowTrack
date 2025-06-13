import * as crypto from 'node:crypto';
import TaskModel from '../task/task.model.js';
import { EmailExistsError } from './errors/email-exists.error.js';
import { ForbiddenError } from './errors/forbidden.error.js';
import { InUseError } from './errors/in-use.error.js';
import { InvalidCredentialsError } from './errors/invalid-credentials.error.js';
import UserModel from './user.model.js';

const ENCODING = 'hex';

export const UserService = {
  /**
   * @param {import('pino').BaseLogger} log
   * @param {string} password
   * @returns {string}
   */
  createSHA(log, password) {
    const logger = log.child({
      component: 'UserService',
      method: 'createSHA',
    });
    logger.info('Hashing password');

    const shaHash = crypto.createHmac(
      process.env.PASSWORD_ALGORITHM,
      process.env.PASSWORD_SALT_SECRET,
    );

    const hashed = shaHash.update(password).digest(ENCODING);
    logger.info('Password hashed');
    return hashed;
  },

  /**
   * @param {User|null} user
   * @returns {SafeUser|null}
   */
  sanitizeUser(user) {
    if (user === null) {
      return null;
    }
    const { password: _password, ...rest } = user;
    return rest;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<SafeUser|null>}
   */
  async getUserById(log, db, id) {
    const logger = log.child({
      component: 'UserService',
      method: 'getUserById',
      id,
    });
    logger.info('Starting to retrieve user by ID');

    /** @type {User|undefined} */
    const foundUser = await UserModel.query(db).findById(id);
    logger.info({ userId: foundUser?.id }, 'User retrieved by ID successfully');

    return this.sanitizeUser(foundUser || null);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<SafeUser[]>}
   */
  async listUsers(log, db) {
    const logger = log.child({
      component: 'UserService',
      method: 'listUsers',
    });
    logger.info('Listing all users');

    /** @type {User[]} */
    const foundUsers = await UserModel.query(db).select();
    logger.info({ count: foundUsers.length }, 'Listed all users successfully');

    return foundUsers.map((foundUser) => this.sanitizeUser(foundUser));
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @returns {Promise<SafeUser>}
   */
  async getAuthorizedUserById(log, db, inputId, userId) {
    const logger = log.child({
      component: 'UserService',
      method: 'getAuthorizedUserById',
      inputId,
      userId,
    });
    logger.info('Starting to retrieve user by ID with authorization check');

    /** @type {User|undefined} */
    const foundUser = await UserModel.query(db).findById(inputId);
    if (!foundUser || foundUser.id.toString() !== userId.toString()) {
      logger.warn('Access denied: current user is not allowed to view this record');
      throw new ForbiddenError();
    }

    logger.info('Authorized user retrieved by ID successfully');

    return this.sanitizeUser(foundUser);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async getUserByEmail(log, db, email) {
    const logger = log.child({
      component: 'UserService',
      method: 'getUserByEmail',
      inputEmail: email,
    });
    logger.info('Starting to retrieve user by Email');

    /** @type {User|undefined} */
    const foundUser = await UserModel.query(db).findOne({ email });
    logger.info('User retrieved by Email successfully');

    return foundUser || null;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {UserRegisterData} data
   * @returns {Promise<SafeUser>}
   */
  async createUser(log, db, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'createUser',
      email: data.email,
    });
    logger.info('Creating new user');

    /** @type {User|undefined} */
    const existingUser = await this.getUserByEmail(logger, db, data.email);
    if (existingUser) {
      logger.warn('Email already in use');
      throw new EmailExistsError(data.email);
    }
    const hashedPassword = this.createSHA(logger, data.password);

    /** @type {User} */
    const createdUser = await UserModel
      .query(db)
      .insert({ ...data, password: hashedPassword })
      .returning('*');

    logger.info({ userId: createdUser.id }, 'User created successfully');

    return this.sanitizeUser(createdUser);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {UserLoginData} data
   * @returns {Promise<SafeUser>}
   */
  async authUser(log, db, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'authUser',
      email: data.email,
    });
    logger.info('Authenticating user');

    /** @type {User|undefined} */
    const existingUser = await this.getUserByEmail(logger, db, data.email);
    if (!existingUser) {
      logger.warn('User with given email not found');
      throw new InvalidCredentialsError();
    }

    const inputPasswordHash = this.createSHA(logger, data.password);
    if (inputPasswordHash !== existingUser.password) {
      logger.warn('Invalid password');
      throw new InvalidCredentialsError();
    }
    logger.info('User logged in successfully');

    return this.sanitizeUser(existingUser);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async deleteUser(log, db, inputId, userId) {
    const logger = log.child({
      component: 'UserService',
      method: 'deleteUser',
      inputId,
      userId,
    });
    logger.info('Deleting user');

    /** @type {User|undefined} */
    const foundUser = await UserModel.query(db).findById(inputId);
    if (!foundUser || foundUser.id.toString() !== userId.toString()) {
      logger.warn('Access denied: current user is not allowed to delete this user record');
      throw new ForbiddenError();
    }

    const inUseCount = await TaskModel.query(db)
      .where('creatorId', inputId)
      .orWhere('executorId', inputId)
      .resultSize();
    if (inUseCount > 0) {
      logger.warn({ inUseCount }, 'Cannot delete user: still referenced in tasks');
      throw new InUseError();
    }

    /** @type {number} */
    const deletedCount = await UserModel.query(db).deleteById(inputId);
    logger.info({ deletedCount }, 'User deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @param {Partial<UserRegisterData>} data
   * @returns {Promise<SafeUser|null>}
   */
  async updateUser(log, db, inputId, userId, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'updateUser',
      inputId,
      userId,
    });
    logger.info('Updating user');

    /** @type {User|undefined} */
    const foundUser = await UserModel.query(db).findById(inputId);
    if (!foundUser || foundUser.id.toString() !== userId.toString()) {
      logger.warn('Access denied: current user is not allowed to edit this user record');
      throw new ForbiddenError();
    }

    /** @type {User|undefined} */
    const existingUser = await this.getUserByEmail(logger, db, data.email);
    if (existingUser && existingUser.id.toString() !== inputId.toString()) {
      logger.warn('Email already in use');
      throw new EmailExistsError(data.email);
    }

    /** @type {User} */
    const updatedUser = await UserModel.query(db).patchAndFetchById(inputId, data);
    logger.info({ updatedUserId: updatedUser.id }, 'User updated successfully');

    return this.sanitizeUser(updatedUser);
  },
};

export function getUserServiceInfo() {
  return {
    name: 'UserService',
    description: 'Service for managing user data',
  };
}
