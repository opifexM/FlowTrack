export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export function getInvalidCredentialsErrorInfo() {
  return {
    name: 'InvalidCredentialsError',
    description: 'Error thrown when provided credentials are invalid',
  };
}
