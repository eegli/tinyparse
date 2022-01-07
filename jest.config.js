/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  collectCoverageFrom: ['<rootDir>/src/**'],
  coverageThreshold: {
    global: {
      statements: 100,
    },
  },
};
