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

  report(event: ReportEvent): Promise<Response> | void {
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

  private get isOfficial() {
    return /^https:\/\/langchao.org/.test(window.location.href)
  }

  private handleDuration(duration: DurationEvent) {
    if (!this.isOfficial) {
      if (this.option.verbose) {
        console.log('[enderpearl]', duration);
      }
      return;
    }
    let initUrl = `${this.baseUrl}/duration?actionType=${
      duration.actionType
    }`;
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(initUrl);
  }

  private handleLocation(locEvt: LocationEvent) {
    if (!this.isOfficial) {
      if (this.option.verbose) {
        console.log('[enderpearl]', locEvt);
      }
      return;
    }
    let initUrl = `${this.baseUrl}/location?url=${btoa(
      locEvt.url,
    )}`;
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(initUrl);
  }

  private handleBusiness(business: BusinessEvent) {
    if (!this.isOfficial) {
      if (this.option.verbose) {
        console.log('[enderpearl]', business);
      }
      return;
    }
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
