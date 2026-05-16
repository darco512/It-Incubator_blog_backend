/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 60_000,
  forceExit: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ["/post\\.e2e\\.test\\.ts$", "/blog\\.e2e\\.test\\.ts$",],
  testRegex: ["__tests__/.*.e2e.test.ts$", "__tests__/service_tests/.*.test.ts$"],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false
    }],
    'node_modules/uuid': ['ts-jest', {
      useESM: false
    }]
  },
}
