export class InUseError extends Error {
  constructor() {
    super('Status in use');
    this.name = 'InUseError';
  }
}

export function getInUseErrorInfo() {
  return {
    name: 'InUseError',
    description: 'Error thrown when a status is referenced elsewhere',
  };
}
