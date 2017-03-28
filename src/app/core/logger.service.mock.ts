import { Injectable } from '@angular/core';

@Injectable()
export class MockLoggerService {
  log = jasmine.createSpy('log');
}
