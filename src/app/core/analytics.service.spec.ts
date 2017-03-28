import { ReflectiveInjector } from '@angular/core';
import { AnalyticsService, CONFIG, NULL_DIMENSION } from './analytics.service';
import { LoggerService } from './logger.service';
import { MockLoggerService } from './logger.service.mock';
import { fakeAsync, tick } from '@angular/core/testing';
import { environment } from '../../environments/environment';

describe('AnalyticsService', () => {
  let gaSpy: jasmine.Spy;
  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      AnalyticsService,
      { provide: LoggerService, useClass: MockLoggerService }
    ]);
  });

  describe('with declared ga', () => {
    let analytics: AnalyticsService;

    beforeEach(fakeAsync(() => {
      this.originalGa = window['ga'];
      window['ga'] = (fn: Function) => {
        window['ga'] = gaSpy = jasmine.createSpy('ga');
        fn();
        tick(AnalyticsService.setupDelay);
      };
      analytics = injector.get(AnalyticsService);
      analytics.configure();
    }));

    afterEach(() => {
      window['ga'] = this.originalGa;
    });

    it('should setup the tracker', () => {
      gaSpy.calls.allArgs().forEach((args) => console.log('XXX', args));
      expect(gaSpy.calls.count()).toBeGreaterThanOrEqual(10);

      const events: any[] = gaSpy.calls.allArgs();
      expect(events[0]).toEqual(['create', environment.analytics.trackingId, 'auto']);
      expect(events[1]).toEqual(['set', 'transport', 'beacon']);
      expect(events[2]).toEqual(['set', CONFIG.dimensions.TRACKING_VERSION, NULL_DIMENSION]);
      expect(events[3]).toEqual(['set', CONFIG.dimensions.CLIENT_ID, NULL_DIMENSION]);
      expect(events[4]).toEqual(['set', CONFIG.dimensions.WINDOW_ID, NULL_DIMENSION]);
      expect(events[5]).toEqual(['set', CONFIG.dimensions.HIT_ID, NULL_DIMENSION]);
      expect(events[6]).toEqual(['set', CONFIG.dimensions.HIT_TIME, NULL_DIMENSION]);
      expect(events[7]).toEqual(['set', CONFIG.dimensions.HIT_TYPE, NULL_DIMENSION]);
      expect(events[8]).toEqual(['set', CONFIG.dimensions.HIT_SOURCE, NULL_DIMENSION]);
      expect(events[9]).toEqual(['set', CONFIG.dimensions.VISIBILITY_STATE, NULL_DIMENSION]);
    });

    it('should send an initial page view', () => {
      expect(gaSpy.calls.count()).toBeGreaterThanOrEqual(13);

      const events: any[] = gaSpy.calls.allArgs();
      expect(events[12]).toEqual(['send', 'pageview', { [CONFIG.dimensions.HIT_SOURCE]: 'pageload' }]);
    });

    it('should send navigation timing', () => {
      expect(gaSpy.calls.count()).toBeGreaterThanOrEqual(14);

      const events: any[] = gaSpy.calls.allArgs();
      expect(events[13][0]).toBe('send');
      expect(events[13][1]).toBe('event');

      const payload: any = events[13][2];
      expect(payload['eventCategory']).toBe('Navigation Timing');
      expect(payload['eventAction']).toBe('track');
      expect(payload['nonInteraction']).toBe(true);
      expect(payload[CONFIG.metrics.RESPONSE_END_TIME]).toBeGreaterThanOrEqual(0);
      expect(payload[CONFIG.metrics.DOM_LOAD_TIME]).toBeGreaterThanOrEqual(0);
      expect(payload[CONFIG.metrics.WINDOW_LOAD_TIME]).toBeGreaterThanOrEqual(0);
    });
  });

  describe('without declared ga', () => {
    let analytics: AnalyticsService;
    let logger: MockLoggerService;

    beforeEach(() => {
      analytics = injector.get(AnalyticsService);
      logger = injector.get(LoggerService);
      analytics.configure();
    });

    it('should setup the tracker', () => {
      expect(logger.log.calls.count()).toBeGreaterThanOrEqual(10);

      const events: any[] = logger.log.calls.allArgs()
        .map((args) => args[1]);
      expect(events[0]).toEqual(['create', environment.analytics.trackingId, 'auto']);
      expect(events[1]).toEqual(['set', 'transport', 'beacon']);
      expect(events[2]).toEqual(['set', CONFIG.dimensions.TRACKING_VERSION, NULL_DIMENSION]);
      expect(events[3]).toEqual(['set', CONFIG.dimensions.CLIENT_ID, NULL_DIMENSION]);
      expect(events[4]).toEqual(['set', CONFIG.dimensions.WINDOW_ID, NULL_DIMENSION]);
      expect(events[5]).toEqual(['set', CONFIG.dimensions.HIT_ID, NULL_DIMENSION]);
      expect(events[6]).toEqual(['set', CONFIG.dimensions.HIT_TIME, NULL_DIMENSION]);
      expect(events[7]).toEqual(['set', CONFIG.dimensions.HIT_TYPE, NULL_DIMENSION]);
      expect(events[8]).toEqual(['set', CONFIG.dimensions.HIT_SOURCE, NULL_DIMENSION]);
      expect(events[9]).toEqual(['set', CONFIG.dimensions.VISIBILITY_STATE, NULL_DIMENSION]);
    });

    it('should send an initial page view', () => {
      expect(logger.log.calls.count()).toBeGreaterThanOrEqual(13);

      const events: any[] = logger.log.calls.allArgs()
        .map((args) => args[1]);
      expect(events[12]).toEqual(['send', 'pageview', { [CONFIG.dimensions.HIT_SOURCE]: 'pageload' }]);
    });

    it('should send navigation timing', () => {
      expect(logger.log.calls.count()).toBeGreaterThanOrEqual(14);

      const events: any[] = logger.log.calls.allArgs()
        .map((args) => args[1]);
      expect(events[13][0]).toBe('send');
      expect(events[13][1]).toBe('event');

      const payload: any = events[13][2];
      expect(payload['eventCategory']).toBe('Navigation Timing');
      expect(payload['eventAction']).toBe('track');
      expect(payload['nonInteraction']).toBe(true);
      expect(payload[CONFIG.metrics.RESPONSE_END_TIME]).toBeGreaterThanOrEqual(0);
      expect(payload[CONFIG.metrics.DOM_LOAD_TIME]).toBeGreaterThanOrEqual(0);
      expect(payload[CONFIG.metrics.WINDOW_LOAD_TIME]).toBeGreaterThanOrEqual(0);
    });
  });
});
