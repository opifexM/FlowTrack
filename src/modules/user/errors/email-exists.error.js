export class EmailExistsError extends Error {
  /**
   * @param {string} email
   */
  constructor(email) {
    super(`The user with the email '${email}' already exists`);
    this.name = 'EmailExistsError';
  }
}

export function getEmailExistsErrorInfo() {
  return {
    name: 'EmailExistsError',
    description: 'Error thrown when a user with the given email already exists',
  };
}
