export const TASK_VALIDATION = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  DESCRIPTION: {
    MIN: 1,
    MAX: 10000,
  },
};

export function getTaskValidationInfo() {
  return {
    name: 'TASK_VALIDATION',
    description: 'Validation rules for task fields',
  };
}
