export class InUseError extends Error {
  constructor() {
    super('Label in use');
    this.name = 'InUseError';
  }
}

export function getInUseErrorInfo() {
  return {
    name: 'InUseError',
    description: 'Error thrown when a label is referenced elsewhere',
  };
}
