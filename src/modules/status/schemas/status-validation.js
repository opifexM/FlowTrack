export const STATUS_VALIDATION = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
};

export function getStatusValidationInfo() {
  return {
    name: 'STATUS_VALIDATION',
    description: 'Validation rules for user fields',
  };
}
