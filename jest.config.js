module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/json/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
  ],
  verbose: true,
  testTimeout: 10000,
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'node',
      testMatch: ['**/test/*.test.js'],
    },
  ],
};
