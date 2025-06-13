export class NameExistsError extends Error {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(`The label with the name '${name}' already exists`);
    this.name = 'NameExistsError';
  }
}

export function getNameExistsErrorInfo() {
  return {
    name: 'NameExistsError',
    description: 'Error thrown when a label with the given name already exists',
  };
}
