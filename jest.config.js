/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  snapshotFormat: {
    printBasicPrototype: false,
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
  collectCoverageFrom: ['<rootDir>/src/**'],
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },
  projects: [
    {
      displayName: {
        color: 'cyan',
        name: 'unit',
      },
      testMatch: ['<rootDir>/test/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/_setup.ts'],
    },
    {
      displayName: {
        color: 'magenta',
        name: 'types',
      },
      runner: 'jest-runner-tsd',
      testMatch: ['<rootDir>/test/types/*.test.ts'],
    },
  ],
};
