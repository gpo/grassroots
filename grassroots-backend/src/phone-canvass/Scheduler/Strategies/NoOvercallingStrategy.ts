import { filter, map, Observable, pairwise, tap } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class NoOvercallingStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$: Observable<undefined>;

  constructor(metricsLogger: PhoneCanvassMetricsTracker) {
    super(metricsLogger);
    this.nextCall$ = metricsLogger.idleCallerCountObservable.pipe(
      pairwise(),
      tap(([prev, curr]) => {
        console.log("IDLE CALLER COUNT GOING FROM", prev, curr);
      }),
      // Any time there's an increase in the idleCallerCount, and it's bigger than 0 emit.
      // When callers mark "last call", we can get in a situation where we have
      // negative idle callers.
      filter(([prev, curr]) => curr > prev && curr > 0),

      map(() => undefined),
      tap(() => {
        console.log("STRATEGY GENERATING");
      }),
    );
  }
}
