export function delay(ms: number): Promise<void> {
  if (!Number.isFinite(ms) || ms <= 0 || ms > 2_147_483_647) {
    throw new Error(`Invalid timeout: ${String(ms)}`);
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}
