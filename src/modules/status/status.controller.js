import i18next from 'i18next';
import { InUseError, NameExistsError, NotFoundError } from './status.error.js';
import { StatusService } from './status.service.js';
import { STATUS_VALIDATION } from './schemas/status-validation.js';

const { t } = i18next;

export const StatusController = {
  async showStatusList(request, reply) {
    const logger = request.log.child({
      component: 'StatusController',
      method: 'showStatusList',
    });
    logger.info('Displaying status list page');

    try {
      const statusList = await StatusService.listStatuses(
        request.server.log,
        request.server.knex,
      );
      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ statusCount: statusList.length }, 'Status list retrieved successfully');

      return reply.view('status/list', { flash, statuses: statusList, isAuthenticated });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to display status list');
      request.flash('danger', t('status-list.errors.general'));

      return reply.redirect('/');
    }
  },

  async showCreateForm(request, reply) {
    const logger = request.log.child({
      component: 'StatusController',
      method: 'showCreateForm',
    });

    logger.info('Displaying status creation form');
    const { formData: [form = {}] = [], ...flash } = reply.flash();
    const isAuthenticated = Boolean(request.session.get('userId'));

    return reply.view('status/create', { flash, form, STATUS_VALIDATION, isAuthenticated });
  },

  async create(request, reply) {
    const logger = request.log.child({
      component: 'StatusController',
      method: 'create',
    });
    logger.info('Starting status creation');

    try {
      const createdStatus = await StatusService.createStatus(
        request.server.log,
        request.server.knex,
        request.body.data,
      );
      logger.info({ statusId: createdStatus.id }, 'Status created successfully');
      request.flash('info', t('status-create.success'));

      return reply.redirect('/statuses');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Status creation failed');
      request.flash('formData', request.body.data);

      if (error instanceof NameExistsError) {
        request.flash('warning', t('status-create.errors.nameExists'));
      }
      else {
        request.flash('danger', t('status-create.errors.general'));
      }

      return reply.redirect('/statuses/new');
    }
  },

  async showEditForm(request, reply) {
    const logger = request.log.child({
      component: 'StatusController',
      method: 'showEditForm',
      inputId: request.params.id,
    });
    logger.info('Displaying status edit form');

    try {
      const foundStatus = await StatusService.getStatusById(
        request.server.log,
        request.server.knex,
        request.params.id,
      );

      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ statusId: foundStatus.id }, 'Status retrieved successfully');

      return reply.view('status/edit', { flash, status: foundStatus, STATUS_VALIDATION, isAuthenticated });
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetStatusId: request.params.id,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load status data for editing');

      if (error instanceof NotFoundError) {
        request.flash('warning', t('status-edit.errors.notFound'));
      }
      else {
        request.flash('danger', t('status-edit.errors.general'));
      }

      return reply.redirect('/statuses');
    }
  },

  async delete(request, reply) {
    const inputId = request.params.id.toString();

    const logger = request.log.child({
      component: 'StatusController',
      method: 'delete',
      inputId: inputId,
    });
    logger.info('Starting status deletion');

    try {
      const deletedCount = await StatusService.deleteStatus(
        request.server.log,
        request.server.knex,
        inputId,
      );

      request.flash('success', t('status-delete.success'));
      logger.info({ deletedCount: deletedCount }, 'Status deleted successfully');

      return reply.redirect('/statuses');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetStatusId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Status deletion failed');

      if (error instanceof InUseError) {
        request.flash('warning', t('status-delete.errors.inUse'));
      }
      else if (error instanceof NotFoundError) {
        request.flash('warning', t('status-delete.errors.notFound'));

        return reply.redirect(`/statuses`);
      }
      else {
        request.flash('danger', t('status-delete.errors.general'));
      }

      return reply.redirect('/statuses');
    }
  },

  async update(request, reply) {
    const inputId = request.params.id.toString();

    const logger = request.log.child({
      component: 'StatusController',
      method: 'update',
      inputId: inputId,
    });
    logger.info('Starting status update');

    try {
      const updatedStatus = await StatusService.updateStatus(
        request.server.log,
        request.server.knex,
        inputId,
        request.body.data,
      );
      request.flash('success', t('status-update.success'));
      logger.info({ updatedStatusId: updatedStatus.id }, 'Status updated successfully');

      return reply.redirect('/statuses');
    }
    catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetStatusId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Status update failed');

      if (error instanceof NameExistsError) {
        request.flash('warning', t('status-update.errors.nameExists'));

        return reply.redirect(`/statuses/${inputId}/edit`);
      }
      else if (error instanceof NotFoundError) {
        request.flash('warning', t('status-update.errors.notFound'));

        return reply.redirect(`/statuses`);
      }
      else {
        request.flash('danger', t('status-update.errors.general'));
      }

      return reply.redirect('/statuses');
    }
  },
};
