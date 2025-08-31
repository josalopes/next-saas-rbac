/** @typedef {import('eslint').Linter.Config} */

module.exports = {
  extends: ['@rocketseat/eslint/node'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error'
  }
}