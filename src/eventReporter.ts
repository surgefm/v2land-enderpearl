import { Option } from './option';
import { ReportEvent } from './events/event';
import { DurationEvent } from './events/duration';
import { LocationEvent } from './events/location';
import { BusinessEvent } from './events/business';

const ENDER_ID = 'enderId';

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

export class EventReporter {
  private clientId: string;

  constructor(public readonly optionThunk: () => Option) {
    const KEY = `${ENDER_ID}=`;
    const index = document.cookie.indexOf(KEY);

    if (index >= 0) {
      const tail = document.cookie.slice(index);
      this.clientId = tail.slice(0, tail.indexOf(';'));
    } else {
      this.clientId = generateUUID();
      document.cookie += ` ${ENDER_ID}=${this.clientId}`;
    }
  }

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
    let initUrl = `${this.baseUrl}/duration?u=${this.clientId}&actionType=${
      duration.actionType
    }`;
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(initUrl, {
      credentials: 'include',
    });
  }

  private handleLocation(locEvt: LocationEvent) {
    if (!this.isOfficial) {
      if (this.option.verbose) {
        console.log('[enderpearl]', locEvt);
      }
      return;
    }
    let initUrl = `${this.baseUrl}/location?u=${this.clientId}&url=${btoa(
      locEvt.url,
    )}`;
    if (locEvt.referrer) {
      initUrl += `&referrer=${btoa(locEvt.referrer)}`;
    }
    if (locEvt.redirectFrom) {
      initUrl += `&redirectFrom=${btoa(locEvt.redirectFrom)}`
    }
    if (this.option.userId) {
      initUrl += `&userId=${this.option.userId}`;
    }
    return fetch(initUrl, {
      credentials: 'include',
    });
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
      u: this.clientId,
      action,
      meta,
    };
    return fetch(this.baseUrl + '/business', {
      method: 'POST',
      body: JSON.stringify(reportData),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      credentials: 'include',
    });
  }
}
