/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  snapshotFormat: {
    printBasicPrototype: false,
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
  collectCoverageFrom: ['<rootDir>/src/**'],
  setupFilesAfterEnv: ['<rootDir>/test/_setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/integration/'],
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },
};
