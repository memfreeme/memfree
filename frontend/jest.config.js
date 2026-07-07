// jest.config.js
module.exports = {
    roots: ['<rootDir>/lib'],
    testMatch: ['**/tests/**/*.test.+(ts|tsx)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/lib/store/tests/setupTests.ts'],
    testEnvironment: 'jest-environment-jsdom',
};
