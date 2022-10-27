module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  extends: 'standard-with-typescript',
  ignorePatterns: [
    "migrations/*.js", 
    "seeders/*.js",
    ".eslintrc.js",
    "config/*.js",
    "jest.config.js"
  ]
};