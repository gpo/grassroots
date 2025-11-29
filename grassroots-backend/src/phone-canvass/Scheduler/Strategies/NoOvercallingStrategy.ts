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
        console.log("IDLE CALL COUNT GOING FROM", prev, curr);
      }),
      // Any time there's an increase in the idleCallerCount, emit.
      filter(([prev, curr]) => curr > prev),

      map(() => undefined),
      tap(() => {
        console.log("STRATEGY GENERATING");
      }),
    );
  }
}
