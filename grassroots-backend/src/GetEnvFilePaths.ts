// Earlier files take priority.
export function getEnvFilePaths(): string[] {
  return process.env.MODE == "test"
    ? ["../.env.test"]
    : ["../.env.development.local", "../.env.development"];
}
