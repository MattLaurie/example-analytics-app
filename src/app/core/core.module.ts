import { APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from './analytics.service';
import { LoggerService } from './logger.service';

export function _initialise(analytics: AnalyticsService) {
  return () => analytics.configure();
}

@NgModule({
  imports: [
    CommonModule
  ]
})
export class CoreModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        AnalyticsService,
        LoggerService,
        {
          provide: APP_INITIALIZER,
          useFactory: _initialise,
          deps: [ AnalyticsService ],
          multi: true
        }
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
