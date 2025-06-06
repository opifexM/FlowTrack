export class NameExistsError extends Error {
  /**
   * @param {string} name
   */
  constructor(name) {
    super(`The label with the name '${name}' already exists`);
    this.name = 'NameExistsError';
  }
}

export class InUseError extends Error {
  constructor() {
    super('Label in use');
    this.name = 'InUseError';
  }
}
