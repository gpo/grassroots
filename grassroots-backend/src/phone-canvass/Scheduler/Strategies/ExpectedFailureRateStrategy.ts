import { concatMap, filter, map, of, Subject, tap } from "rxjs";
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

    const callsToMake$ = metricsTracker.callAndCallerCounts$.pipe(
      map(({ calls, callers }) => {
        const currentCallsThatMightFail = calls.committed - calls.active;
        if (currentCallsThatMightFail < 0) {
          throw new Error("Every committed call should also be active.");
        }
        const availableCallers =
          callers.ready_no_contact +
          callers.ready_with_contact -
          calls.committed;
        const targetCallsThatMightFail = Math.floor(
          availableCallers / expectedSuccessRate,
        );
        console.log({
          calls,
          callers,
          targetCallsThatMightFail,
          currentCallsThatMightFail,
        });
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
