import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';

const { t } = i18next;

/**
 * @typedef {Object} TaskFilterQuery
 * @property {string} status
 * @property {string} executor
 * @property {string} label
 * @property {boolean} isCreatorUser
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: TaskFilterQuery }
 * }>}
 */
export const taskFilterSchema = createYupSchema(yup => ({
  querystring: yup
    .object({
      status: yup.string().default(''),
      executor: yup.string().default(''),
      label: yup.string().default(''),
      isCreatorUser: yup
        .boolean()
        .transform(v => ['true', 'on', true].includes(v))
        .default(false),
    })
    .required(),
}));
