export class NotFoundError extends Error {
  constructor(id) {
    super(`The task with ID '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export function getNotFoundErrorInfo() {
  return {
    name: 'NotFoundError',
    description: 'Error thrown when a task with the given ID is not found',
  };
}
