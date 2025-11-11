export function delay(ms: number): Promise<void> {
  if (ms > 100000) {
    throw new Error("Delay over 100 seconds");
  }
  if (!Number.isFinite(ms) || ms <= 0 || ms > 2_147_483_647) {
    throw new Error(`Invalid timeout: ${String(ms)}`);
  }
  console.log(ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
