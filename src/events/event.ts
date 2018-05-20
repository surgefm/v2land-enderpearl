export type EventType =
  | 'Duration'
  | 'Location'
  | 'Business';

export interface ReportEvent {
  type: EventType;
}
