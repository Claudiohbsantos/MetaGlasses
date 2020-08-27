module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    "plugin:sonarjs/recommended",
    'react-app',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking', // could impact performance
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    // 'plugin:import/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'jest', 'import','sonarjs'],
  rules: {
    'prettier/prettier': 'error',
    curly: ['error', 'multi-line'],
  },
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  settings: {
    "react": {
      "version": "detect"
    }
  },
}
