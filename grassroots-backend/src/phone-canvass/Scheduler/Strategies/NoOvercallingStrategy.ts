import { filter, map, Observable, tap } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class NoOvercallingStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$: Observable<undefined>;

  constructor(metricsLogger: PhoneCanvassMetricsTracker) {
    super(metricsLogger);
    this.nextCall$ = metricsLogger.idleCallerCountObservable.pipe(
      tap((idleCallerCount) => {
        console.log("idleCallerCount", { idleCallerCount });
      }),
      // Any time we have idle callers, emit once.
      // If there are multiple idle callers, this will get triggered
      // again, so idleCallerCount will trend to 0.
      filter((idleCallerCount) => idleCallerCount > 0),
      map(() => undefined),
    );
  }
}
