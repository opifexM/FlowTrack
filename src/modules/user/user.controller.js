import i18next from 'i18next';
import { USER_VALIDATION } from './schemas/user-validation.js';
import { EmailExistsError, ForbiddenError, InvalidCredentialsError } from './user.error.js';
import { UserService } from './user.service.js';

const { t } = i18next;

export const UserController = {
  async showUserList(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'showUserList',
    });
    logger.info('Displaying user list page');

    try {
      /** @type {SafeUser[]} */
      const userList = await UserService.listUsers(
        request.server.log,
        request.server.knex,
      );
      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ userCount: userList.length }, 'User list retrieved successfully');

      return reply.view('user/list', { flash, users: userList, isAuthenticated });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to display user list');
      request.flash('danger', t('user-list.errors.general'));

      return reply.redirect('/');
    }
  },

  async showRegisterForm(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'showRegisterForm',
    });

    logger.info('Displaying user registration form');
    const { formData: [form] = [{}], ...flash } = reply.flash?.() || {};
    const isAuthenticated = Boolean(request.session.get('userId'));

    return reply.view('user/register', { flash, form, USER_VALIDATION, isAuthenticated });
  },

  async register(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'register',
    });
    logger.info('Starting user registration');

    try {
      /** @type {SafeUser} */
      const createdUser = await UserService.createUser(
        request.server.log,
        request.server.knex,
        request.body.data,
      );
      logger.info({ userId: createdUser.id }, 'User registered successfully');
      request.flash('info', t('user-register.success'));

      return reply.redirect('/');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        email: request.body.data?.email,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        requestId: request.id,
      }, 'User registration failed');
      request.flash('formData', request.body.data);

      if (error instanceof EmailExistsError) {
        request.flash('warning', t('user-register.errors.emailExists'));
      }
      else {
        request.flash('danger', t('user-register.errors.general'));
      }

      return reply.redirect('/users/new');
    }
  },

  async showLoginForm(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'showLoginForm',
    });
    logger.info('Displaying login form');

    const { formData: [form] = [{}], ...flash } = reply.flash?.() || {};
    const isAuthenticated = Boolean(request.session.get('userId'));

    return reply.view('user/login', { flash, form, isAuthenticated });
  },

  async login(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'login',
    });
    logger.info('Starting user authentication');

    try {
      /** @type {SafeUser} */
      const authenticatedUser = await UserService.authUser(
        request.server.log,
        request.server.knex,
        request.body.data,
      );

      await request.session.set('userId', authenticatedUser.id);
      request.flash('success', t('user-login.success'));
      logger.info({ userId: authenticatedUser.id }, 'User logged in successfully');

      return reply.redirect('/');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        email: request.body.data?.email,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        sessionId: request.session.sessionId,
        requestId: request.id,
      }, 'User authentication failed');
      request.flash('formData', request.body.data);

      if (error instanceof InvalidCredentialsError) {
        request.flash('warning', t('user-login.errors.invalidCredentials'));
      }
      else {
        request.flash('danger', t('user-login.errors.general'));
      }

      return reply.redirect('/session/new');
    }
  },

  async destroySession(log, session) {
    const logger = log.child({
      component: 'UserController',
      method: 'destroySession',
      userId: session.get('userId'),
    });
    logger.info('Starting session destruction');
    await session.set('userId', undefined);

    logger.info('Session destroyed successfully');
  },

  async logout(request, reply) {
    const logger = request.log.child({
      component: 'UserController',
      method: 'logout',
      userId: request.session.get('userId'),
    });
    logger.info('Starting user logout');

    await this.destroySession(logger, request.session);
    request.flash('info', t('user-logout.success'));
    logger.info('User logged out successfully');

    return reply.redirect('/');
  },

  async showEditForm(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'UserController',
      method: 'showEditForm',
      inputId: inputId,
      userId: request.session.get('userId'),
    });
    logger.info('Displaying user edit form');

    try {
      /** @type {SafeUser} */
      const foundUser = await UserService.getAuthorizedUserById(
        request.server.log,
        request.server.knex,
        inputId,
        request.session.get('userId'),
      );

      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ userId: foundUser.id }, 'User retrieved successfully');

      return reply.view('user/edit', { flash, user: foundUser, isAuthenticated });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetUserId: inputId,
        currentUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load user data for editing');

      if (error instanceof ForbiddenError) {
        request.flash('warning', t('user-edit.errors.forbidden'));
      }
      else {
        request.flash('danger', t('user-edit.errors.general'));
      }

      return reply.redirect('/');
    }
  },

  async delete(request, reply) {
    const inputId = request.params.id.toString();
    const userId = request.session.get('userId').toString();
    const logger = request.log.child({
      component: 'UserController',
      method: 'delete',
      inputId: inputId,
      userId: userId,
    });
    logger.info('Starting user deletion');

    try {
      const deletedCount = await UserService.deleteUser(
        request.server.log,
        request.server.knex,
        inputId,
        userId,
      );

      if (inputId === userId) {
        await this.destroySession(logger, request.session);
      }

      request.flash('success', t('user-delete.success'));
      logger.info({ deletedCount: deletedCount }, 'User deleted successfully');

      return reply.redirect('/users');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetUserId: inputId,
        currentUserId: userId,
        isSelfDeletion: inputId === userId,
        requestId: request.id,
      }, 'User deletion failed');

      if (error instanceof ForbiddenError) {
        request.flash('warning', t('user-delete.errors.forbidden'));
      }
      else {
        request.flash('danger', t('user-delete.errors.general'));
      }

      return reply.redirect('/users');
    }
  },

  async update(request, reply) {
    const inputId = request.params.id.toString();
    const userId = request.session.get('userId').toString();
    const logger = request.log.child({
      component: 'UserController',
      method: 'update',
      inputId: inputId,
      userId: userId,
    });
    logger.info('Starting user update');

    try {
      /** @type {SafeUser} */
      const updatedUser = await UserService.updateUser(
        request.server.log,
        request.server.knex,
        inputId,
        userId,
        request.body.data,
      );
      request.flash('success', t('user-update.success'));
      logger.info({ updatedUserId: updatedUser.id }, 'User updated successfully');

      return reply.redirect('/users');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetUserId: inputId,
        currentUserId: userId,
        requestId: request.id,
      }, 'User update failed');

      if (error instanceof EmailExistsError) {
        request.flash('warning', t('user-register.errors.emailExists'));

        return reply.redirect(`/users/${inputId}/edit`);
      }
      else if (error instanceof ForbiddenError) {
        request.flash('warning', t('user-update.errors.forbidden'));
      }
      else {
        request.flash('danger', t('user-update.errors.general'));
      }

      return reply.redirect('/users');
    }
  },
};
