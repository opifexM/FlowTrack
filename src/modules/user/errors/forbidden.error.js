export class ForbiddenError extends Error {
  constructor() {
    super('Access is denied');
    this.name = 'ForbiddenError';
  }
}

export function getForbiddenErrorInfo() {
  return {
    name: 'ForbiddenError',
    description: 'Error thrown when user has no permission to perform the action',
  };
}
