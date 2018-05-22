import { ReportEvent } from './event';

export enum DurationActionType {
  Click = 0,
  MouseMove = 1,
  KeyDown = 64,
  Resize = 128,
  Scroll = 129,
}

export class DurationEvent implements ReportEvent {
  public readonly type = 'Duration';

  public constructor(
    public readonly actionType: DurationActionType,
  ) {}
}
