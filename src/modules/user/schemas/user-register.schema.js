import { createYupSchema } from 'fastify-yup-schema';
import i18next from 'i18next';
import { USER_VALIDATION } from './user-validation.js';

const { t } = i18next;

/**
 * @typedef {Object} UserRegisterData
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 */

/**
 * @type {import('fastify-yup-schema').YupSchemaFactory<{
 *   body: { data: UserRegisterData }
 * }>}
 */
export const userRegisterSchema = createYupSchema((yup) => ({
  body: yup.object({
    data: yup.object({
      firstName: yup.string()
        .required(t('user-register.errors.firstName.required'))
        .min(
          USER_VALIDATION.FIRST_NAME.MIN,
          t('user-register.errors.firstName.min', { count: USER_VALIDATION.FIRST_NAME.MIN }),
        )
        .max(
          USER_VALIDATION.FIRST_NAME.MAX,
          t('user-register.errors.firstName.max', { count: USER_VALIDATION.FIRST_NAME.MAX }),
        ),

      lastName: yup.string()
        .required(t('user-register.errors.lastName.required'))
        .min(
          USER_VALIDATION.LAST_NAME.MIN,
          t('user-register.errors.lastName.min', { count: USER_VALIDATION.LAST_NAME.MIN }),
        )
        .max(
          USER_VALIDATION.LAST_NAME.MAX,
          t('user-register.errors.lastName.max', { count: USER_VALIDATION.LAST_NAME.MAX }),
        ),

      email: yup.string()
        .required(t('user-register.errors.email.required'))
        .email(t('user-register.errors.email.invalid')),

      password: yup.string()
        .required(t('user-register.errors.password.required'))
        .min(
          USER_VALIDATION.PASSWORD.MIN,
          t('user-register.errors.password.min', { count: USER_VALIDATION.PASSWORD.MIN }),
        )
        .max(
          USER_VALIDATION.PASSWORD.MAX,
          t('user-register.errors.password.max', { count: USER_VALIDATION.PASSWORD.MAX }),
        ),
    }).required(),
  }).required(),
}));

export function getUserRegisterSchemaInfo() {
  return {
    name: 'userRegisterSchema',
    description: 'Yup schema for user register payload validation',
  };
}
