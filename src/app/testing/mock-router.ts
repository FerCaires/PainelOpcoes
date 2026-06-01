import { Router, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';

export function createMockRouter(): Partial<Router> {
  return {
    navigate: jasmine.createSpy('navigate'),
    url: '/',
    events: new Subject(),
    createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue({} as UrlTree)
  };
}
