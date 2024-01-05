/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  snapshotFormat: {
    printBasicPrototype: false,
  },
  rootDir: '.',
  roots: ['<rootDir>'],
  collectCoverageFrom: ['<rootDir>/src/**', '!<rootDir>/src/lib/**'],
  coverageThreshold: {
    global: {
      statements: 90,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/_release'],
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
        color: 'yellow',
        name: 'e2e',
      },
      testMatch: ['<rootDir>/test/e2e/*.test.ts'],
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
