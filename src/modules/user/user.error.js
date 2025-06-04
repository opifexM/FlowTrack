export class EmailExistsError extends Error {
  /**
   * @param {string} email
   */
  constructor(email) {
    super(`The user with the email '${email}' already exists`);
    this.name = 'EmailExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Access is denied');
    this.name = 'ForbiddenError';
  }
}
