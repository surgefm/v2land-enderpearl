import OptionThunk from './option';
import { EventReporter } from './eventReporter';
import { LocationEvent } from './events/location';
import {
  DurationEvent,
  DurationActionType,
} from './events/duration';

const reporter = new EventReporter(OptionThunk);

const lazyCollectorMap: { [index: string]: number } = {};

function lazyCollector(
  name: string,
  timeout: number,
  callback: () => any,
) {
  if (name in lazyCollectorMap) {
    lazyCollectorMap[name]++;
  } else {
    lazyCollectorMap[name] = 1;
  }

  setTimeout(() => {
    lazyCollectorMap[name]--;
    if (lazyCollectorMap[name] === 0) {
      callback();
      delete lazyCollectorMap[name];
    }
  }, timeout);
}

function init() {
  const referrer = document.referrer.length > 0 ? document.referrer : undefined;
  reporter.report(new LocationEvent(location.href, undefined, referrer));

  {
    const srcPush = window.history.pushState;
    const wrappedPush = (data: string, ...args: any[]) => {
      reporter.report(new LocationEvent(location.href, data));
      return (srcPush as any)(data, ...args);
    }
    window.history.pushState = wrappedPush;
  }

  {
    const srcReplace = window.history.replaceState;
    const wrappedReplace = (data: string, ...args: any[]) => {
      reporter.report(new LocationEvent(location.href, data));
      return (srcReplace as any)(data, ...args);
    }
    window.history.pushState = wrappedReplace;
  }

  document.addEventListener('click', () => {
    reporter.report(
      new DurationEvent(DurationActionType.Click),
    );
  });

  document.addEventListener('mousemove', () => {
    lazyCollector('mousemove', 500, () => {
      reporter.report(
        new DurationEvent(DurationActionType.MouseMove),
      );
    });
  });

  document.addEventListener('keydown', () => {
    reporter.report(
      new DurationEvent(DurationActionType.KeyDown),
    );
  });

  window.addEventListener('resize', () => {
    lazyCollector('resize', 500, () => {
      reporter.report(
        new DurationEvent(DurationActionType.Resize),
      );
    });
  });

  document.addEventListener('scroll', () => {
    lazyCollector('scroll', 500, () => {
      reporter.report(
        new DurationEvent(DurationActionType.Scroll),
      );
    });
  });

  // chrome only event
  document.addEventListener('mousewheel', () => {
    lazyCollector('scroll', 500, () => {
      reporter.report(
        new DurationEvent(DurationActionType.Scroll),
      );
    });
  });
}

init();

(window as any).__ENDERMAN_REPORTER__ = reporter;
