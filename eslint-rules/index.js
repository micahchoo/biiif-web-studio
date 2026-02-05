/**
 * @field-studio/eslint-plugin
 * Custom ESLint rules for Atomic Design + FSD architecture enforcement
 */

import moleculePropsValidation from './rules/molecule-props-validation.js';
import useEffectRestrictions from './rules/useeffect-restrictions.js';
import templateConstraints from './rules/template-constraints.js';

const plugin = {
  meta: {
    name: '@field-studio/eslint-plugin',
    version: '1.0.0',
  },
  rules: {
    'molecule-props-validation': moleculePropsValidation,
    'useeffect-restrictions': useEffectRestrictions,
    'template-constraints': templateConstraints,
  },
  configs: {
    recommended: {
      plugins: ['@field-studio'],
      rules: {
        '@field-studio/molecule-props-validation': 'warn',
        '@field-studio/useeffect-restrictions': 'error',
        '@field-studio/template-constraints': 'error',
      },
    },
    strict: {
      plugins: ['@field-studio'],
      rules: {
        '@field-studio/molecule-props-validation': 'error',
        '@field-studio/useeffect-restrictions': 'error',
        '@field-studio/template-constraints': 'error',
      },
    },
  },
};

export default plugin;
