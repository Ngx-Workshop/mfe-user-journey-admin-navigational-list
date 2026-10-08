import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MenuStore } from '../../../../../src/app/features/navigation/state/menu.store';
import { menuItem } from '../menu.fixture';

const url = '/api/navigational-list';
describe('MenuStore', () => {
  let store: MenuStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(MenuStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shares one initial request and derives hierarchy/statistics from all items', () => {
    store.ensureLoaded();
    store.ensureLoaded();
    http
      .expectOne(url)
      .flush([
        menuItem(),
        menuItem({ _id: 'archived', archived: true }),
      ]);
    expect(store.items().length).toBe(2);
    expect(store.statistics()[2].value).toBe(1);
    expect(
      store.hierarchy()[0].structuralSubtypes['NAV'].states!['FULL']
        .length
    ).toBe(1);
    store.ensureLoaded();
    http.expectNone(url);
  });

  it('cancels stale refreshes and preserves current data after load failure', () => {
    store.refresh();
    http.expectOne(url).flush([menuItem()]);
    store.refresh();
    const old = http.expectOne(url);
    store.refresh();
    expect(old.cancelled).toBeTrue();
    http
      .expectOne(url)
      .flush('unavailable', {
        status: 503,
        statusText: 'Unavailable',
      });
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toContain('retry');
    store.refresh();
    http.expectOne(url).flush([]);
    expect(store.error()).toBeNull();
    expect(store.items()).toEqual([]);
  });

  it('blocks duplicate writes, retains data on failure and permits retry', () => {
    store.refresh();
    http.expectOne(url).flush([menuItem()]);
    store.archive$(menuItem()._id).subscribe({ error: () => {} });
    store.archive$(menuItem()._id).subscribe();
    const request = http.expectOne(
      `${url}/${menuItem()._id}/archive`
    );
    expect(store.pending()).toBeTrue();
    request.flush('failed', { status: 500, statusText: 'Error' });
    expect(store.pending()).toBeFalse();
    expect(store.items()[0].archived).toBeFalse();
    store.archive$(menuItem()._id).subscribe();
    http
      .expectOne(`${url}/${menuItem()._id}/archive`)
      .flush(menuItem({ archived: true }));
    http.expectOne(url).flush([menuItem({ archived: true })]);
    expect(store.statistics()[2].value).toBe(1);
    expect(
      store.hierarchy()[0].structuralSubtypes['NAV']
    ).toBeUndefined();
  });

  it('clears a parent using the sort contract after a successful edit', () => {
    store.refresh();
    http.expectOne(url).flush([menuItem({ parentId: 'parent' })]);
    store
      .update$(menuItem()._id, {
        menuItemText: 'Edited',
        sortId: 2,
        parentId: undefined,
      })
      .subscribe();
    http
      .expectOne(`${url}/${menuItem()._id}`)
      .flush(
        menuItem({ menuItemText: 'Edited', parentId: 'parent' })
      );
    const sort = http.expectOne(`${url}/sort`);
    expect(sort.request.body).toEqual({
      _id: menuItem()._id,
      sortId: 2,
    });
    sort.flush(
      menuItem({
        menuItemText: 'Edited',
        sortId: 2,
        parentId: undefined,
      })
    );
    http
      .expectOne(url)
      .flush([
        menuItem({
          menuItemText: 'Edited',
          sortId: 2,
          parentId: undefined,
        }),
      ]);
    expect(store.items()[0].parentId).toBeUndefined();
  });
  it('keeps a started write alive when its originating view unsubscribes', () => {
    store.refresh();
    http.expectOne(url).flush([menuItem()]);
    const subscription = store.archive$(menuItem()._id).subscribe();
    const pending = http.expectOne(
      `${url}/${menuItem()._id}/archive`
    );
    subscription.unsubscribe();
    expect(pending.cancelled).toBeFalse();
    pending.flush(menuItem({ archived: true }));
    http.expectOne(url).flush([menuItem({ archived: true })]);
    expect(store.items()[0].archived).toBeTrue();
    expect(store.pending()).toBeFalse();
  });
});
