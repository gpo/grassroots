import { combineLatest, filter, map, Observable } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class ExpectedFailureRateStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$: Observable<undefined>;

  constructor(
    metricsLogger: PhoneCanvassMetricsTracker,
    // The fraction of calls made we expect to reach a human.
    // We should be conservative here, as an overestimate will result in overcalling.
    expectedSuccessRate: number,
  ) {
    super(metricsLogger);

    const callsToMake$ = combineLatest({
      readyCallers: metricsLogger.readyCallerCount$,
      activeSuccessfulCalls: metricsLogger.activeSuccessfulCallsCount$,
      committedCalls: metricsLogger.committedCallsCount,
    }).pipe(
      map(({ readyCallers, activeSuccessfulCalls, committedCalls }) => {
        const currentCallsThatMightFail =
          committedCalls - activeSuccessfulCalls;
        const availableCallers = readyCallers - activeSuccessfulCalls;
        const targetCallsThatMightFail = Math.floor(
          availableCallers / expectedSuccessRate,
        );
        return targetCallsThatMightFail - currentCallsThatMightFail;
      }),
    );

    this.nextCall$ = callsToMake$.pipe(
      filter((x) => x > 0),
      map(() => undefined),
    );
  }
}
