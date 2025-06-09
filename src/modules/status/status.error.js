export class NameExistsError extends Error {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(`The status with the name '${name}' already exists`);
    this.name = 'NameExistsError';
  }
}

export class InUseError extends Error {
  constructor() {
    super('Status in use');
    this.name = 'InUseError';
  }
}

export class NotFoundError extends Error {
  constructor(id) {
    super(`The status with ID '${id}' not found`);
    this.name = 'NotFoundError';
  }
}
