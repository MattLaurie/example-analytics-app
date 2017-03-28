import { TestBed, async } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerService } from './core/logger.service';
import { MockLoggerService } from './core/logger.service.mock';
import { AnalyticsService } from './core/analytics.service';
import { MockAnalyticsService } from './core/analytics.service.mock';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: AnalyticsService, useValue: MockAnalyticsService },
        { provide: LoggerService, useValue: MockLoggerService }
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
