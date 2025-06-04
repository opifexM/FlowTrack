import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';

const { t } = i18next;

/**
 * @typedef {Object} UserLoginData
 * @property {string} email
 * @property {string} password
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: UserLoginData }
 * }>}
 */
export const userLoginSchema = createYupSchema(yup => ({
  body: yup.object({
    data: yup.object({
      email: yup.string()
        .required(t('user-login.errors.email.required'))
        .email(t('user-login.errors.email.invalid')),
      password: yup.string()
        .required(t('user-login.errors.password.required')),
    }).required(),
  }).required(),
}));
