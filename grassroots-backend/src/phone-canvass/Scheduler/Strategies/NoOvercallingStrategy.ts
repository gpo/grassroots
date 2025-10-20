import { filter, firstValueFrom } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";

export class NoOvercallingStrategy extends PhoneCanvassSchedulerStrategy {
  async waitForNextCall(): Promise<void> {
    // Wait until there's an available caller.
    await firstValueFrom(
      this.metricsLogger.idleCallerCountObservable.pipe(filter((x) => x > 0)),
    );
  }
}
