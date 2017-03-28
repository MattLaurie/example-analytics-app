import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

import 'rxjs/add/operator/filter';

import { AnalyticsService } from './core/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private analytics: AnalyticsService, private router: Router, private location: Location) {
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.analytics.sendPageView(location.prepareExternalUrl(event.urlAfterRedirects));
      });
  }
}
