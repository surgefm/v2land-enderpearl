import { Option } from './option';
import { ReportEvent } from './events/event';
import { DurationEvent } from './events/duration';
import { LocationEvent } from './events/location';
import { BusinessEvent } from './events/business';

export class EventReporter {
  constructor(public readonly optionThunk: () => Option) {}

  get option() {
    return this.optionThunk();
  }

  get baseUrl() {
    const option = this.option;
    return option.reportBaseUrl + option.repositoryName;
  }

  report(event: ReportEvent): Promise<Response> {
    switch (event.type) {
      case 'Duration':
        return this.handleDuration(event as DurationEvent);
      case 'Location':
        return this.handleLocation(event as LocationEvent);
      case 'Business':
        return this.handleBusiness(event as BusinessEvent);
    }
  }

  reportLocationChange(url: string) {
    this.report(new LocationEvent(url));
  }

  private handleDuration(duration: DurationEvent) {
    let initUrl = `${this.baseUrl}/duration?actionType=${
      duration.actionType
    }`;
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(initUrl);
  }

  private handleLocation(locEvt: LocationEvent) {
    let initUrl = `${this.baseUrl}/location?url=${btoa(
      locEvt.url,
    )}`;
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(this.baseUrl + '/location');
  }

  private handleBusiness(business: BusinessEvent) {
    const { action, meta } = business;
    const reportData = {
      action,
      meta,
    };
    return fetch(this.baseUrl + '/business', {
      method: 'POST',
      body: JSON.stringify(reportData),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  }
}
