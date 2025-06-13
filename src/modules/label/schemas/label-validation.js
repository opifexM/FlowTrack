export const LABEL_VALIDATION = {
  NAME: {
    MIN: 1,
    MAX: 100,
  },
};

export function getLabelValidationInfo() {
  return {
    name: 'LABEL_VALIDATION',
    description: 'Validation rules for label fields',
  };
}
