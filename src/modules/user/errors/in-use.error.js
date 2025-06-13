export class InUseError extends Error {
  constructor() {
    super('User in use');
    this.name = 'InUseError';
  }
}

export function getInUseErrorInfo() {
  return {
    name: 'InUseError',
    description: 'Error thrown when a user record is referenced elsewhere',
  };
}
