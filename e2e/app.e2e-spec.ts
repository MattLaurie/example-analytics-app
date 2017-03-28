import { AnalyticsAppPage } from './app.po';

describe('analytics-app App', () => {
  let page: AnalyticsAppPage;

  beforeEach(() => {
    page = new AnalyticsAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
