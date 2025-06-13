import { createYupSchema } from 'fastify-yup-schema';

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
export const taskFilterSchema = createYupSchema((yup) => ({
  querystring: yup
    .object({
      status: yup.string().default(''),
      executor: yup.string().default(''),
      label: yup.string().default(''),
      isCreatorUser: yup
        .boolean()
        .transform((v) => ['true', 'on', true].includes(v))
        .default(false),
    })
    .required(),
}));

export function getTaskFilterSchemaInfo() {
  return {
    name: 'taskFilterSchema',
    description: 'Yup schema for task filter query validation',
  };
}
