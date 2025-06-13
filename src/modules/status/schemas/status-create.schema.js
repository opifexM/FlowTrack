import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';
import { STATUS_VALIDATION } from './status-validation.js';

const { t } = i18next;

/**
 * @typedef {Object} StatusCreateData
 * @property {string} name
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: StatusCreateData }
 * }>}
 */
export const statusCreateSchema = createYupSchema((yup) => ({
  body: yup.object({
    data: yup.object({
      name: yup.string()
        .required(t('status-create.errors.name.required'))
        .min(
          STATUS_VALIDATION.NAME.MIN,
          t('status-create.errors.name.min', { count: STATUS_VALIDATION.NAME.MIN }),
        )
        .max(
          STATUS_VALIDATION.NAME.MAX,
          t('status-create.errors.name.max', { count: STATUS_VALIDATION.NAME.MAX }),
        ),
    }).required(),
  }).required(),
}));

export function getStatusCreateSchemaInfo() {
  return {
    name: 'statusCreateSchema',
    description: 'Yup schema for status payload validation',
  };
}
