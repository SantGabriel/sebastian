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
      setupFiles: ['<rootDir>/test/setup.js'],
      testMatch: ['**/test/*.test.js'],
    },
  ],
};
