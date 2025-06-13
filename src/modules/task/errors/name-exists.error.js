export class NameExistsError extends Error {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(`The task with the name '${name}' already exists`);
    this.name = 'NameExistsError';
  }
}

export function getNameExistsErrorInfo() {
  return {
    name: 'NameExistsError',
    description: 'Error thrown when a task with the given name already exists',
  };
}
