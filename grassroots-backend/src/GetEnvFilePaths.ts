// Earlier files take priority.
export function getEnvFilePaths(): string[] {
  if (process.env.GITHUB_ACTIONS == "true") {
    return ["../.env.test.ci", "../.env/test"];
  }
  if (process.env.MODE == "test") {
    return ["../.env.test"];
  }
  return ["../.env.development.local", "../.env.development"];
}
