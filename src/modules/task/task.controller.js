import i18next from 'i18next';
import { TASK_VALIDATION } from './schemas/task-validation.js';
import { NameExistsError, NotFoundError } from './task.error.js';
import { TaskService } from './task.service.js';

const { t } = i18next;

export const TaskController = {
  async showTaskList(request, reply) {
    const userId = request.session.get('userId').toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'showTaskList',
    });
    logger.info('Displaying task list page');

    try {
      /** @type {TaskFilterQuery} */
      const filters = request.query;

      /** @type {Task[]} */
      const taskList = await TaskService.listTasks(
        request.server.log,
        request.server.knex,
        filters,
        userId,
      );
      const { statuses, users, labels } = await TaskService.getTaskOptions(
        request.server.log,
        request.server.knex,
      );

      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ taskCount: taskList.length }, 'Task list retrieved successfully');

      return reply.view('task/list', { flash, tasks: taskList, isAuthenticated, statuses, users, labels, filters });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to display task list');
      request.flash('danger', t('task-list.errors.general'));

      return reply.redirect('/');
    }
  },

  async showTask(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'showTask',
      inputId: inputId,
    });
    logger.info('Displaying task page');

    try {
      /** @type {Task} */
      const foundTask = await TaskService.getTaskById(
        request.server.log,
        request.server.knex,
        inputId,
      );
      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ taskId: foundTask.id }, 'Task retrieved successfully');

      return reply.view('task/show', { flash, task: foundTask, isAuthenticated });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetTaskId: request.params.id,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load task data');

      if (error instanceof NotFoundError) {
        request.flash('warning', t('task-show.errors.notFound'));
      }
      else {
        request.flash('danger', t('task-show.errors.general'));
      }

      return reply.redirect('/tasks');
    }
  },

  async showCreateForm(request, reply) {
    const logger = request.log.child({
      component: 'TaskController',
      method: 'showCreateForm',
    });
    logger.info('Displaying task creation form');

    try {
      const { statuses, users, labels } = await TaskService.getTaskOptions(
        request.server.log,
        request.server.knex,
      );
      const { formData: [form = {}] = [], ...flash } = reply.flash();
      const isAuthenticated = Boolean(request.session.get('userId'));

      return reply.view('task/create', { flash, form, TASK_VALIDATION, isAuthenticated, statuses, users, labels });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load task creation form');
      request.flash('danger', t('task-create.errors.general'));

      return reply.redirect('/');
    }
  },

  async create(request, reply) {
    const userId = request.session.get('userId').toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'create',
      userId: userId,
    });
    logger.info('Starting task creation');

    try {
      /** @type {Task} */
      const createdTask = await TaskService.createTask(
        request.server.log,
        request.server.knex,
        userId,
        request.body.data,
      );
      logger.info({ taskId: createdTask.id }, 'Task created successfully');
      request.flash('info', t('task-create.success'));

      return reply.redirect('/tasks');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
        userId: userId,
      }, 'Task creation failed');
      request.flash('formData', request.body.data);

      if (error instanceof NameExistsError) {
        request.flash('warning', t('task-create.errors.nameExists'));
      }
      else {
        request.flash('danger', t('task-create.errors.general'));
      }

      return reply.redirect('/tasks/new');
    }
  },

  async showEditForm(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'showEditForm',
      inputId: inputId,
    });
    logger.info('Displaying task edit form');

    try {
      /** @type {Task} */
      const foundTask = await TaskService.getTaskById(
        request.server.log,
        request.server.knex,
        inputId,
      );
      const { statuses, users, labels } = await TaskService.getTaskOptions(
        request.server.log,
        request.server.knex,
      );

      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ taskId: foundTask.id }, 'Task retrieved successfully');

      return reply.view('task/edit', { flash, task: foundTask, TASK_VALIDATION, isAuthenticated, statuses, users, labels });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetTaskId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load task data for editing');

      if (error instanceof NotFoundError) {
        request.flash('warning', t('task-edit.errors.notFound'));
      }
      else {
        request.flash('danger', t('task-edit.errors.general'));
      }

      return reply.redirect('/tasks');
    }
  },

  async delete(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'delete',
      inputId: inputId,
    });
    logger.info('Starting task deletion');

    try {
      const deletedCount = await TaskService.deleteTask(
        request.server.log,
        request.server.knex,
        inputId,
      );

      request.flash('success', t('task-delete.success'));
      logger.info({ deletedCount: deletedCount }, 'Task deleted successfully');

      return reply.redirect('/tasks');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetTaskId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Task deletion failed');

      if (error instanceof NotFoundError) {
        request.flash('warning', t('task-delete.errors.notFound'));
      }
      else {
        request.flash('danger', t('task-delete.errors.general'));
      }

      return reply.redirect('/tasks');
    }
  },

  async update(request, reply) {
    const inputId = request.params.id.toString();
    const userId = request.session.get('userId').toString();
    const logger = request.log.child({
      component: 'TaskController',
      method: 'update',
      inputId: inputId,
    });
    logger.info('Starting task update');

    try {
      /** @type {Task} */
      const updatedTask = await TaskService.updateTask(
        request.server.log,
        request.server.knex,
        inputId,
        userId,
        request.body.data,
      );
      request.flash('success', t('task-update.success'));
      logger.info({ updatedTaskId: updatedTask.id }, 'Task updated successfully');

      return reply.redirect('/tasks');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetTaskId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Task update failed');

      if (error instanceof NameExistsError) {
        request.flash('warning', t('task-update.errors.nameExists'));

        return reply.redirect(`/tasks/${inputId}/edit`);
      }
      else if (error instanceof NotFoundError) {
        request.flash('warning', t('task-update.errors.notFound'));

        return reply.redirect(`/tasks`);
      }
      else {
        request.flash('danger', t('task-update.errors.general'));
      }

      return reply.redirect('/tasks');
    }
  },
};
