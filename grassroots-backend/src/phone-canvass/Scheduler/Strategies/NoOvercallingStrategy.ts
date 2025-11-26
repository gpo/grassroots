import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  Observable,
  pairwise,
} from "rxjs";
import { PhoneCanvassSchedulerStrategy } from "./PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export class NoOvercallingStrategy extends PhoneCanvassSchedulerStrategy {
  nextCall$: Observable<undefined>;

  constructor(metricsLogger: PhoneCanvassMetricsTracker) {
    super(metricsLogger);
    this.nextCall$ = metricsLogger.idleCallerCountObservable.pipe(
      pairwise(),
      // Any time there's an increase in the idleCallerCount, emit.
      filter(([prev, curr]) => curr > prev),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      map(() => undefined),
    );
  }
}
