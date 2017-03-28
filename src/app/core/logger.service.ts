import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {
  log(msg, ...args) {
    console.log(msg, args);
  }
}
