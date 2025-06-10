import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';
import { TASK_VALIDATION } from './task-validation.js';

const { t } = i18next;

/**
 * @typedef {Object} TaskCreateData
 * @property {string} name
 * @property {string} description
 * @property {string} statusId
 * @property {string} executorId
 * @property {string[]} labelIds
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: TaskCreateData }
 * }>}
 */
export const taskCreateSchema = createYupSchema(yup => ({
  body: yup.object({
    data: yup.object({
      name: yup.string()
        .required(t('task-create.errors.name.required'))
        .min(
          TASK_VALIDATION.NAME.MIN,
          t('task-create.errors.name.min', { count: TASK_VALIDATION.NAME.MIN }),
        )
        .max(
          TASK_VALIDATION.NAME.MAX,
          t('task-create.errors.name.max', { count: TASK_VALIDATION.NAME.MAX }),
        ),
      description: yup.string()
        .min(
          TASK_VALIDATION.DESCRIPTION.MIN,
          t('task-create.errors.description.min', { count: TASK_VALIDATION.DESCRIPTION.MIN }),
        )
        .max(
          TASK_VALIDATION.DESCRIPTION.MAX,
          t('task-create.errors.description.max', { count: TASK_VALIDATION.DESCRIPTION.MAX }),
        ),
      statusId: yup.string()
        .required(t('task-create.errors.status.required')),
      executorId: yup.string()
        .nullable(),
      labels: yup
        .array()
        .of(yup.string())
        .transform((value, original) => {
          if (original == null) {
            return [];
          }
          if (typeof original === 'string') {
            return [original];
          }
          return original;
        })
        .default([]),
    }).required(),
  }).required(),
}));
