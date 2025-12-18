import { combineLatest, concatMap, filter, map, of, Subject, tap } from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class ExpectedFailureRateStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$ = new Subject<undefined>();

  constructor(
    metricsTracker: PhoneCanvassMetricsTracker,
    // The fraction of calls made we expect to reach a human.
    // We should be conservative here, as an overestimate will result in overcalling.
    expectedSuccessRate: number,
  ) {
    super(metricsTracker);

    const callsToMake$ = combineLatest({
      callerCounts: metricsTracker.callerCounts$,
      committedAndActiveCallCounts: metricsTracker.committedAndActiveCallCounts,
    }).pipe(
      map(({ callerCounts, committedAndActiveCallCounts }) => {
        console.log({ callerCounts, committedAndActiveCallCounts });
        const currentCallsThatMightFail =
          committedAndActiveCallCounts.committed -
          committedAndActiveCallCounts.active;
        if (currentCallsThatMightFail < 0) {
          throw new Error("Every committed call should also be active.");
        }
        // TODO: we shouldn't distinguish between types of ready.
        const availableCallers =
          callerCounts.ready_no_caller +
          callerCounts.ready_with_caller -
          committedAndActiveCallCounts.committed;
        const targetCallsThatMightFail = Math.floor(
          availableCallers / expectedSuccessRate,
        );
        console.log({ targetCallsThatMightFail, currentCallsThatMightFail });
        return targetCallsThatMightFail - currentCallsThatMightFail;
      }),
    );

    callsToMake$
      .pipe(
        filter((x) => x > 0),
        concatMap(() => {
          return of(undefined).pipe(
            tap(() => {
              console.log("EMITTING");
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
