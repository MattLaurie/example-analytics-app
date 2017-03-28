export class MockAnalyticsService {
  configure = jasmine.createSpy('configure');
  sendPageView = jasmine.createSpy('sendPageView');
  sendError = jasmine.createSpy('sendError');
}
