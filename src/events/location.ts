import { ReportEvent } from './event';

export class LocationEvent implements ReportEvent {
  public readonly type = 'Location';

  public constructor(
    public readonly url: string,
    public readonly redirectFrom?: string,
    public readonly referrer?: string,
  ) {}
}
