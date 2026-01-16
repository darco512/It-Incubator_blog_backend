/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
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