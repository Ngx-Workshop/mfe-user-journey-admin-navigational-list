import { CreateMenuItemPage } from '../../src/app/features/navigation/pages/create-menu-item-page.component';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Routes } from '../../src/app/app.routes';
import { By } from '@angular/platform-browser';
import { mfeRemote } from './features/navigation/mfe.fixture';
import { menuItem } from './features/navigation/menu.fixture';

describe('Routed navigation workspace', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(Routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('combines the complete ordered catalog with hierarchy and redirects legacy hierarchy links', async () => {
    const harness = await RouterTestingHarness.create('/hierarchy');
    http.expectOne('/api/navigational-list').flush(
      Array.from({ length: 25 }, (_, i) =>
        menuItem({
          _id: String(i),
          menuItemText: `Item ${String(i).padStart(2, '0')}`,
          sortId: i + 1,
        })
      )
    );
    harness.detectChanges();
    await harness.fixture.whenStable();
    const root = harness.routeNativeElement!;
    expect(TestBed.inject(Router).url).toBe('/');
    expect(root.querySelector('mat-paginator')).toBeNull();
    expect(root.querySelector('a[href="/hierarchy"]')).toBeNull();
    expect(root.querySelectorAll('ngx-menu-tree-row').length).toBe(
      25
    );
    const search = root.querySelector(
      'ngx-menu-filters input'
    ) as HTMLInputElement;
    search.value = 'Item 24';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(root.querySelectorAll('ngx-menu-tree-row').length).toBe(1);
    expect(
      root.querySelector('ngx-menu-tree-row')!.textContent
    ).toContain('Item 24');
    expect(
      (
        root.querySelector(
          'button[aria-label="Move Item 24 up"]'
        ) as HTMLButtonElement
      ).disabled
    ).toBeTrue();
    (
      root.querySelector(
        'button[aria-label="Edit Item 24"]'
      ) as HTMLButtonElement
    ).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/edit/24');
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote()]);
    await harness.navigateByUrl('/');
    expect(root.querySelector('mat-tab-group')).toBeNull();
  });

  it('loads direct edit links, retains failed edits, and returns to the list after saving', async () => {
    const item = menuItem();
    const harness = await RouterTestingHarness.create(
      `/edit/${item._id}`
    );
    expect(harness.routeNativeElement!.textContent).toContain(
      'Loading menu item'
    );
    http.expectOne('/api/navigational-list').flush([item]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const form = harness.fixture.debugElement.query(
      By.directive(CreateMenuItemPage)
    ).componentInstance.model as CreateMenuItemPage['model'];
    expect(form.form.controls.menuItemText.value).toBe(
      item.menuItemText
    );
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote()]);
    expect(form.form.controls.routePath.invalid).toBeTrue();
    form.form.controls.routePath.setValue('dashboard');
    form.form.controls.menuItemText.setValue('Changed destination');
    form.next();
    form.next();
    form.submit();
    form.submit();
    expect(
      await TestBed.inject(Router).navigateByUrl('/hierarchy')
    ).toBeFalse();
    http
      .expectOne(`/api/navigational-list/${item._id}`)
      .flush('failed', { status: 500, statusText: 'Error' });
    expect(form.form.controls.menuItemText.value).toBe(
      'Changed destination'
    );
    expect(TestBed.inject(Router).url).toBe(`/edit/${item._id}`);
    form.submit();
    http
      .expectOne(`/api/navigational-list/${item._id}`)
      .flush({ ...item, menuItemText: 'Changed destination' });
    http.expectOne('/api/navigational-list').flush([item]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('keeps create/edit navigation inside the host mount and replaces forms when edit IDs change', async () => {
    TestBed.inject(Router).resetConfig([
      { path: 'navigational-list', children: Routes },
    ]);
    const first = menuItem();
    const second = menuItem({
      _id: 'second',
      menuItemText: 'Second destination',
    });
    const harness = await RouterTestingHarness.create(
      `/navigational-list/edit/${first._id}`
    );
    http.expectOne('/api/navigational-list').flush([first, second]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote()]);
    await harness.navigateByUrl('/navigational-list/hierarchy');
    expect(TestBed.inject(Router).url).toBe('/navigational-list');
    await harness.navigateByUrl('/navigational-list/edit/second');
    const form = harness.fixture.debugElement.query(
      By.directive(CreateMenuItemPage)
    ).componentInstance.model as CreateMenuItemPage['model'];
    expect(form.form.controls.menuItemText.value).toBe(
      'Second destination'
    );
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote()]);
    form.editor.cancel();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/navigational-list');
    const link = harness.routeNativeElement!.querySelector(
      'a[href="/navigational-list/create"]'
    ) as HTMLAnchorElement;
    link.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe(
      '/navigational-list/create'
    );
  });

  it('handles missing edit records and creates from a direct route', async () => {
    const harness =
      await RouterTestingHarness.create('/edit/missing');
    http.expectOne('/api/navigational-list').flush([]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain(
      'Menu item not found'
    );
    await harness.navigateByUrl('/create');
    const create = harness.fixture.debugElement.query(
      By.directive(CreateMenuItemPage)
    ).componentInstance as CreateMenuItemPage;
    create.model.form.patchValue({
      menuItemText: 'New destination',
      domain: 'ADMIN',
      routePath: 'new',
      structuralSubtype: 'NAV',
      state: 'FULL',
    });
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('New')]);
    create.model.next();
    create.model.next();
    create.model.submit();
    const request = http.expectOne('/api/navigational-list');
    expect(request.request.method).toBe('POST');
    request.flush(menuItem());
    http.expectOne('/api/navigational-list').flush([menuItem()]);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
