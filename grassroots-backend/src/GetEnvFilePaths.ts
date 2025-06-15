// Earlier files take priority.
export function getEnvFilePaths(): string[] {
  console.log("github actions?", process.env.GITHUB_ACTIONS);
  console.log("mode?", process.env.MODE);
  if (process.env.GITHUB_ACTIONS == "true") {
    return ["../.env.test.ci", "../.env/test"];
  }
  if (process.env.MODE == "test") {
    return ["../.env.test"];
  }
  return ["../.env.development.local", "../.env.development"];
}
