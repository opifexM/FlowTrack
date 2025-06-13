export const USER_VALIDATION = {
  FIRST_NAME: {
    MIN: 1,
    MAX: 100,
  },
  LAST_NAME: {
    MIN: 1,
    MAX: 100,
  },
  PASSWORD: {
    MIN: 3,
    MAX: 100,
  },
};

export function getUserValidationInfo() {
  return {
    name: 'USER_VALIDATION',
    description: 'Validation rules for user fields',
  };
}
