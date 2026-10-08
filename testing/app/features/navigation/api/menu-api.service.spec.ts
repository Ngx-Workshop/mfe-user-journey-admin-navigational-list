import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MenuApiService } from '../../../../../src/app/features/navigation/api/menu-api.service';
import { menuItem } from '../menu.fixture';

describe('MenuApiService', () => {
  let api: MenuApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(MenuApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('is lazy and serializes false archived filters', () => {
    const request = api.findAll$({
      domain: 'ADMIN',
      archived: false,
    });
    http.expectNone(() => true);
    request.subscribe();
    const pending = http.expectOne(
      (r) => r.url === '/api/navigational-list'
    );
    expect(pending.request.params.get('archived')).toBe('false');
    expect(pending.request.params.get('domain')).toBe('ADMIN');
    pending.flush([]);
  });
  it('sends a root reorder without inventing classification fields', () => {
    api
      .reorderMenuItems$({ _id: menuItem()._id, sortId: 2 })
      .subscribe();
    const pending = http.expectOne('/api/navigational-list/sort');
    expect(pending.request.method).toBe('POST');
    expect(pending.request.body).toEqual({
      _id: menuItem()._id,
      sortId: 2,
    });
    pending.flush(menuItem());
  });
});
