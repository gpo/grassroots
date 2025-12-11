import { combineLatest, concatMap, filter, map, of, Subject, tap } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class ExpectedFailureRateStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$ = new Subject<undefined>();

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

    callsToMake$
      .pipe(
        filter((x) => x > 0),
        concatMap(() => {
          return of(undefined).pipe(
            tap(() => {
              this.nextCall$.next(undefined);
            }),
          );
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          throw error;
        },
      });
  }
}
