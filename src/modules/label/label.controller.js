import i18next from 'i18next';
import { InUseError, NameExistsError, NotFoundError } from './label.error.js';
import { LabelService } from './label.service.js';
import { LABEL_VALIDATION } from './schemas/label-validation.js';

const { t } = i18next;

export const LabelController = {
  async showLabelList(request, reply) {
    const logger = request.log.child({
      component: 'LabelController',
      method: 'showLabelList',
    });
    logger.info('Displaying label list page');

    try {
      /** @type {Label[]} */
      const labelList = await LabelService.listLabels(
        request.server.log,
        request.server.knex,
      );
      const flash = reply.flash() || {};
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ labelCount: labelList.length }, 'Label list retrieved successfully');

      return reply.view('label/list', { flash, labels: labelList, isAuthenticated });
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to display label list');
      request.flash('danger', t('label-list.errors.general'));

      return reply.redirect('/');
    }
  },

  async showCreateForm(request, reply) {
    const logger = request.log.child({
      component: 'LabelController',
      method: 'showCreateForm',
    });

    logger.info('Displaying label creation form');
    const { formData: [form] = [{}], invalid = [], ...flash } = reply.flash?.() || {};
    const fieldErrors = Object.fromEntries(invalid.map((validationResult) => [validationResult.field, validationResult.message]));
    const isAuthenticated = Boolean(request.session.get('userId'));

    return reply.view('label/create', {
      flash, form, fieldErrors, LABEL_VALIDATION, isAuthenticated,
    });
  },

  async create(request, reply) {
    const logger = request.log.child({
      component: 'LabelController',
      method: 'create',
    });
    logger.info('Starting label creation');

    try {
      /** @type {Label} */
      const createdLabel = await LabelService.createLabel(
        request.server.log,
        request.server.knex,
        request.body.data,
      );
      logger.info({ labelId: createdLabel.id }, 'Label created successfully');
      request.flash('info', t('label-create.success'));

      return reply.redirect('/labels');
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Label creation failed');
      request.flash('formData', request.body.data);

      if (error instanceof NameExistsError) {
        request.flash('warning', t('label-create.errors.nameExists'));
      } else {
        request.flash('danger', t('label-create.errors.general'));
      }

      return reply.redirect('/labels/new');
    }
  },

  async showEditForm(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'LabelController',
      method: 'showEditForm',
      inputId,
    });
    logger.info('Displaying label edit form');

    try {
      /** @type {Label} */
      const foundLabel = await LabelService.getLabelById(
        request.server.log,
        request.server.knex,
        inputId,
      );

      const { invalid = [], ...flash } = reply.flash?.() || {};
      const fieldErrors = Object.fromEntries(invalid.map((validationResult) => [validationResult.field, validationResult.message]));
      const isAuthenticated = Boolean(request.session.get('userId'));
      logger.info({ labelId: foundLabel.id }, 'Label retrieved successfully');

      return reply.view('label/edit', {
        flash, label: foundLabel, fieldErrors, LABEL_VALIDATION, isAuthenticated,
      });
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetLabelId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Failed to load label data for editing');

      if (error instanceof NotFoundError) {
        request.flash('warning', t('label-edit.errors.notFound'));
      } else {
        request.flash('danger', t('label-edit.errors.general'));
      }

      return reply.redirect('/labels');
    }
  },

  async delete(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'LabelController',
      method: 'delete',
      inputId,
    });
    logger.info('Starting label deletion');

    try {
      const deletedCount = await LabelService.deleteLabel(
        request.server.log,
        request.server.knex,
        inputId,
      );

      request.flash('success', t('label-delete.success'));
      logger.info({ deletedCount }, 'Label deleted successfully');

      return reply.redirect('/labels');
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetLabelId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Label deletion failed');

      if (error instanceof InUseError) {
        request.flash('warning', t('label-delete.errors.inUse'));
      } else if (error instanceof NotFoundError) {
        request.flash('warning', t('label-delete.errors.notFound'));

        return reply.redirect('/labels');
      } else {
        request.flash('danger', t('label-delete.errors.general'));
      }

      return reply.redirect('/labels');
    }
  },

  async update(request, reply) {
    const inputId = request.params.id.toString();
    const logger = request.log.child({
      component: 'LabelController',
      method: 'update',
      inputId,
    });
    logger.info('Starting label update');

    try {
      /** @type {Label} */
      const updatedLabel = await LabelService.updateLabel(
        request.server.log,
        request.server.knex,
        inputId,
        request.body.data,
      );
      request.flash('success', t('label-update.success'));
      logger.info({ updatedLabelId: updatedLabel.id }, 'Label updated successfully');

      return reply.redirect('/labels');
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        targetLabelId: inputId,
        sessionUserId: request.session.get('userId'),
        requestId: request.id,
      }, 'Label update failed');

      if (error instanceof NameExistsError) {
        request.flash('warning', t('label-update.errors.nameExists'));

        return reply.redirect(`/labels/${inputId}/edit`);
      }
      if (error instanceof NotFoundError) {
        request.flash('warning', t('label-update.errors.notFound'));

        return reply.redirect('/labels');
      }

      request.flash('danger', t('label-update.errors.general'));

      return reply.redirect('/labels');
    }
  },
};
