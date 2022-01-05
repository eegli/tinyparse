/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  collectCoverageFrom: ['<rootDir>/src/**', '!<rootDir>/src/index.ts'],
  coverageThreshold: {
    global: {
      statements: 95,
    },
  },
};
