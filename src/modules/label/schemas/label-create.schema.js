import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';
import { LABEL_VALIDATION } from './label-validation.js';

const { t } = i18next;

/**
 * @typedef {Object} LabelCreateData
 * @property {string} name
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: LabelCreateData }
 * }>}
 */
export const labelCreateSchema = createYupSchema(yup => ({
  body: yup.object({
    data: yup.object({
      name: yup.string()
        .required(t('label-create.errors.name.required'))
        .min(
          LABEL_VALIDATION.NAME.MIN,
          t('label-create.errors.name.min', { count: LABEL_VALIDATION.NAME.MIN }),
        )
        .max(
          LABEL_VALIDATION.NAME.MAX,
          t('label-create.errors.name.max', { count: LABEL_VALIDATION.NAME.MAX }),
        ),
    }).required(),
  }).required(),
}));
