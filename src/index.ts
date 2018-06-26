import OptionThunk from './option';
import { EventReporter } from './eventReporter';
import { LocationEvent } from './events/location';
import {
  DurationEvent,
  DurationActionType,
} from './events/duration';
import optionThunk from './option';

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

// 通过 Nuxt 里面的 client 信息获取相应的 maskedId
// 存到 option 里面
async function fetchMaskedClient() {
  const option = optionThunk();
  const win = window as any;
  if (win.__NUXT__ && win.__NUXT__.state.client) {
    const realId = win.__NUXT__.state.client.id;
    const resp = await fetch(`${option.reportBaseUrl}api/v2land/maskedClient?clientId=${realId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await resp.json();
    win.__ENDERPEARL_OPTION__.userId = data.id;
  }
}

function init() {
  fetchMaskedClient();

  const referrer = document.referrer.length > 0 ? document.referrer : undefined;
  reporter.report(new LocationEvent(location.href, undefined, referrer));

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
