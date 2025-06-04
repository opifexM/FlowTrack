import * as crypto from 'node:crypto';
import { EmailExistsError, ForbiddenError, InvalidCredentialsError } from './user.error.js';
import { UserModel } from './user.model.js';

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
   * @returns {Omit<User, 'password'>|null}
   */
  sanitizeUser(user) {
    if (user === null) {
      return null;
    }
    const { password: _password, ...safe } = user;
    return safe;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @returns {Promise<User[]>}
   */
  async listUsers(log, db) {
    const logger = log.child({
      component: 'UserService',
      method: 'listUsers',
    });
    logger.info('Listing all users');

    const foundUsers = await UserModel.findAll(logger, db);
    logger.info({ count: foundUsers.length }, 'Listed all users successfully');

    return foundUsers.map(foundUser => this.sanitizeUser(foundUser));
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async getUserById(log, db, id) {
    const logger = log.child({
      component: 'UserService',
      method: 'getUserById',
      id: id,
    });
    logger.info('Starting to retrieve user by ID');

    const foundUser = await UserModel.findById(logger, db, id);
    logger.info({ userId: foundUser?.id }, 'User retrieved by ID successfully');

    return this.sanitizeUser(foundUser);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @returns {Promise<User|null>}
   */
  async getAuthorizedUserById(log, db, inputId, userId) {
    const logger = log.child({
      component: 'UserService',
      method: 'getAuthorizedUserById',
      inputId: inputId,
      userId: userId,
    });
    logger.info('Starting to retrieve user by ID with authorization check');

    const foundUser = await UserModel.findById(logger, db, inputId);
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

    const foundUser = await UserModel.findByEmail(logger, db, email);
    logger.info('User retrieved by Email successfully');

    return foundUser;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {UserRegisterData} data
   * @returns {Promise<User>}
   */
  async createUser(log, db, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'createUser',
      email: data.email,
    });
    logger.info('Creating new user');

    const existingUser = await this.getUserByEmail(logger, db, data.email);
    if (existingUser) {
      logger.warn('Email already in use');
      throw new EmailExistsError(data.email);
    }
    const hashedPassword = this.createSHA(logger, data.password);

    const createdUser = await UserModel.create(logger, db, { ...data, password: hashedPassword });
    logger.info({ userId: createdUser.id }, 'User created successfully');

    return this.sanitizeUser(createdUser);
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {UserLoginData} data
   * @returns {Promise<User>}
   */
  async authUser(log, db, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'authUser',
      email: data.email,
    });
    logger.info('Authenticating user');

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
      inputId: inputId,
      userId: userId,
    });
    logger.info('Deleting user');

    const foundUser = await UserModel.findById(logger, db, inputId);
    if (!foundUser || foundUser.id.toString() !== userId.toString()) {
      logger.warn('Access denied: current user is not allowed to delete this user record');
      throw new ForbiddenError();
    }

    const deletedCount = await UserModel.remove(logger, db, inputId);
    logger.info({ deletedCount: deletedCount }, 'User deleted successfully');

    return deletedCount;
  },

  /**
   * @param {import('pino').BaseLogger} log
   * @param {import('knex').Knex} db
   * @param {string} inputId
   * @param {string} userId
   * @param {Partial<UserRegisterData>} data
   * @returns {Promise<User|null>}
   */
  async updateUser(log, db, inputId, userId, data) {
    const logger = log.child({
      component: 'UserService',
      method: 'updateUser',
      inputId: inputId,
      userId: userId,
    });
    logger.info('Updating user');

    const foundUser = await UserModel.findById(logger, db, inputId);
    if (!foundUser || foundUser.id.toString() !== userId.toString()) {
      logger.warn('Access denied: current user is not allowed to edit this user record');
      throw new ForbiddenError();
    }

    const updatedUser = await UserModel.update(logger, db, inputId, data);
    logger.info({ updatedUserId: updatedUser.id }, 'User updated successfully');

    return this.sanitizeUser(updatedUser);
  },
};
