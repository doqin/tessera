/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/packages"],
  modulePathIgnorePatterns: ["<rootDir>/packages/.*/dist"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.base.json" }],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "packages/**/src/**/*.{ts,tsx}",
    "!packages/**/src/**/*.test.{ts,tsx}",
    "!packages/**/src/index.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};
