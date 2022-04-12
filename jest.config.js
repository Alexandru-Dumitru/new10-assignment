const path = require('path')

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleDirectories: [
    'node_modules',
    path.join(__dirname, './src'),
    path.join(__dirname, './test'),
  ],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
}
