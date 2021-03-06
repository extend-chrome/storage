/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  transform: {
    '.(js|jsx)': '@sucrase/jest-plugin',
  },
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/tests/v1/',
    '<rootDir>/node_modules/',
  ],
}
