import { Injectable } from '@angular/core';
import { uuid } from '../shared/uuid';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

declare const window: any;

export const TRACKING_VERSION = '1';
export const NULL_DIMENSION = '(not set)';

interface AnalyticsConfig {
  dimensions?: any;
  metrics?: any;
}

export const CONFIG: AnalyticsConfig = {
  dimensions: {
    TRACKING_VERSION: 'dimension1',
    CLIENT_ID: 'dimension2',
    WINDOW_ID: 'dimension3',
    HIT_ID: 'dimension4',
    HIT_TIME: 'dimension5',
    HIT_TYPE: 'dimension6',
    HIT_SOURCE: 'dimension7',
    VISIBILITY_STATE: 'dimension8'
  },
  metrics: {
    RESPONSE_END_TIME: 'metric1',
    DOM_LOAD_TIME: 'metric2',
    WINDOW_LOAD_TIME: 'metric3'
  }
};

@Injectable()
export class AnalyticsService {

  static setupDelay = 1000;

  private ga: (...args: any[]) => void;

  constructor(private logger: LoggerService) {
  }

  configure() {
    this.setupTracker();
    this.trackCustomDimensions();
    this.trackErrors();
    this.sendInitialPageView();
    this.sendNavigationTimingMetrics();
  }

  sendPageView(path) {
    this.ga('send', 'pageview', path);
  }

  sendError(error, extras = {}) {
    this.ga('send', 'event', Object.assign({
      eventCategory: 'Error',
      eventAction: error.name,
      eventLabel: `${error.message}\n${error.stack || '(no stack trace)'}`,
      nonInteraction: true
    }, extras));
  }

  private setupTracker() {
    const ga = window.ga;
    if (ga) {
      const queue: any[][] = [];
      this.ga = (...args: any[]) => {
        queue.push(args);
      };
      ga(() => setTimeout(() => {
        this.ga = window.ga;
        queue.forEach((command) => this.ga.apply(null, command));
      }, AnalyticsService.setupDelay));
    } else {
      this.ga = (...args: any[]) => {
        this.logger.log('ga', args);
      };
    }
    this.ga('create', environment.analytics.trackingId, 'auto');
    this.ga('set', 'transport', 'beacon');
  }

  private sendInitialPageView() {
    const dimensions = CONFIG.dimensions;
    this.ga('send', 'pageview', {
      [dimensions.HIT_SOURCE]: 'pageload'
    });
  }

  private sendNavigationTimingMetrics() {
    if (!(window.performance && window.performance.timing)) {
      return;
    }
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => this.sendNavigationTimingMetrics());
      return;
    }
    const timing = performance.timing;
    const start = timing.navigationStart;
    const responseEnd = Math.round(timing.responseEnd - start);
    const domLoaded = Math.round(timing.domContentLoadedEventStart - start);
    const windowLoaded = Math.round(timing.loadEventStart - start);
    const areAllValidValues = (...values) => {
      return values.every((value) => value > 0 && value < 6e6);
    };
    if (areAllValidValues(responseEnd, domLoaded, windowLoaded)) {
      const metrics = CONFIG.metrics;
      this.ga('send', 'event', {
        eventCategory: 'Navigation Timing',
        eventAction: 'track',
        nonInteraction: true,
        [metrics.RESPONSE_END_TIME]: responseEnd,
        [metrics.DOM_LOAD_TIME]: domLoaded,
        [metrics.WINDOW_LOAD_TIME]: windowLoaded
      });
    }
  }

  private trackCustomDimensions() {
    const dimensions = CONFIG.dimensions;

    // Set default dimension values
    Object.keys(dimensions).forEach((key) => {
      this.ga('set', dimensions[key], NULL_DIMENSION);
    });

    // Adds values known at page load time
    this.ga((tracker) => {
      tracker.set({
        [dimensions.TRACKING_VERSION]: TRACKING_VERSION,
        [dimensions.CLIENT_ID]: tracker.get('clientId'),
        [dimensions.WINDOW_ID]: uuid()
      });
    });

    // Adds tracking before each hit
    this.ga((tracker) => {
      const original = tracker.get('buildHitTask');
      tracker.set('buildHitTask', (model) => {
        const qt = model.get('queueTime') || 0;
        model.set(dimensions.HIT_TIME, String(Date.now() - qt), true);
        model.set(dimensions.HIT_ID, uuid(), true);
        model.set(dimensions.HIT_TYPE, model.get('hitType'), true);
        model.set(dimensions.VISIBILITY_STATE, document.visibilityState, true);
        original(model);
      });
    });
  }

  private trackErrors() {
    const loadErrorEvents = window.__e && window.__e.q || [];
    const extras = {
      eventCategory: 'Uncaught Error'
    };
    for (const event of loadErrorEvents) {
      this.sendError(event.error, extras);
    }
    window.addEventListener('error', (event) => {
      this.sendError(event.error, extras);
    });
  }
}
