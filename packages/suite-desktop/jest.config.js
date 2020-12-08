module.exports = {
    roots: [
        '<rootDir>/src-app',
    ],
    moduleFileExtensions: ['js', 'ts', 'tsx'],
    coverageDirectory: './coverage',
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src-app/http.ts',
    ],
    coverageThreshold: {
        global: {
            statements: 38,
            branches: 0,
            functions: 50,
            lines: 40,
        },
    },
    modulePathIgnorePatterns: [
        'node_modules',
    ],
    transformIgnorePatterns: [
        '/node_modules/',
    ],
    testMatch: [
        '**/*.test.(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'babel-jest',
    },
    verbose: false,
};
