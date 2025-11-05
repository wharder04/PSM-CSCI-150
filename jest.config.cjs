module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.[jt]s"],
  setupFilesAfterEnv: ["<rootDir>/tests/__utils__/env.ts"],
  verbose: true,
  maxWorkers: 1
};
