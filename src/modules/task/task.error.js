export class NameExistsError extends Error {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(`The task with the name '${name}' already exists`);
    this.name = 'NameExistsError';
  }
}

export class NotFoundError extends Error {
  constructor(id) {
    super(`The task with ID '${id}' not found`);
    this.name = 'NotFoundError';
  }
}
