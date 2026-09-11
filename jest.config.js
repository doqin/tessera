/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/packages", "<rootDir>/apps"],
  modulePathIgnorePatterns: ["<rootDir>/packages/.*/dist", "<rootDir>/apps/.*/\\.next"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.base.json" }],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "packages/**/src/**/*.{ts,tsx}",
    "apps/**/components/**/*.{ts,tsx}",
    "apps/**/hooks/**/*.{ts,tsx}",
    "apps/**/services/**/*.{ts,tsx}",
    "!packages/**/src/**/*.test.{ts,tsx}",
    "!packages/**/src/index.{ts,tsx}",
    "!apps/**/*.test.{ts,tsx}",
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
