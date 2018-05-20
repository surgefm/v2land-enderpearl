
import { ReportEvent } from './event';

export class BusinessEvent implements ReportEvent {
  public readonly type = 'Business';

  public constructor(
    public readonly action: string,
    public readonly meta: any,
  ) {}
}
