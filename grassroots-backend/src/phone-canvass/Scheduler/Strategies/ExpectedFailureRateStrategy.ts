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
        console.log({
          readyCallers,
          activeSuccessfulCalls,
          committedCalls,
          targetCallsThatMightFail,
          currentCallsThatMightFail,
        });
        console.log("COMMITTED", committedCalls);
        console.log("TARGET CALLS THAT MIGHT FAIL", targetCallsThatMightFail);
        return targetCallsThatMightFail - currentCallsThatMightFail;
      }),
    );

    callsToMake$
      .pipe(
        filter((x) => x > 0),
        tap(() => {
          console.log("FOO");
        }),
        concatMap(() => {
          return of(undefined).pipe(
            tap(() => {
              this.nextCall$.next(undefined);
            }),
          );
        }),
        tap(() => {
          console.log("MAKING CALL");
        }),
      )
      .subscribe({
        error: (error: unknown) => {
          throw error;
        },
      });
  }
}
