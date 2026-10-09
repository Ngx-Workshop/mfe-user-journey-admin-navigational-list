import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { Routes } from '../../src/app/app.routes';
import { MenuItemFormComponent } from '../../src/app/features/navigation/components/menu-item-form/menu-item-form.component';
import { By } from '@angular/platform-browser';
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

  it('puts statistics above the list and connects toolbar pagination to filtered cards', async () => {
    const harness = await RouterTestingHarness.create('/');
    http
      .expectOne('/api/navigational-list')
      .flush(
        Array.from({ length: 25 }, (_, i) =>
          menuItem({
            _id: String(i),
            menuItemText: `Item ${String(i).padStart(2, '0')}`,
          })
        )
      );
    harness.detectChanges();
    await harness.fixture.whenStable();
    const root = harness.routeNativeElement!;
    expect(root.querySelector('mat-tab-group')).toBeNull();
    expect(
      root
        .querySelector('ngx-menu-statistics')!
        .compareDocumentPosition(
          root.querySelector('ngx-menu-list')!
        ) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      root.querySelector('ngx-menu-managenment-actions mat-paginator')
    ).toBeNull();
    expect(
      root.querySelector('.menu-grid__controls mat-paginator')
    ).not.toBeNull();
    const paginator = await TestbedHarnessEnvironment.loader(
      harness.fixture
    ).getHarness(MatPaginatorHarness);
    await paginator.goToNextPage();
    expect(root.querySelectorAll('ngx-menu-item-card').length).toBe(
      12
    );
    expect(
      root.querySelector('ngx-menu-item-card')!.textContent
    ).toContain('Item 12');
    const search = root.querySelector(
      'ngx-menu-filters input'
    ) as HTMLInputElement;
    search.value = 'Item 24';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(root.querySelectorAll('ngx-menu-item-card').length).toBe(
      1
    );
    expect(await paginator.getRangeLabel()).toContain('1 – 1 of 1');
    const link = root.querySelector(
      'a[href="/hierarchy"]'
    ) as HTMLAnchorElement;
    link.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/hierarchy');
    expect(
      harness.routeNativeElement!.querySelector(
        'ngx-menu-hierarchy-manager'
      )
    ).not.toBeNull();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/');
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
      By.directive(MenuItemFormComponent)
    ).componentInstance as MenuItemFormComponent;
    expect(form.form.controls.menuItemText.value).toBe(
      item.menuItemText
    );
    form.form.controls.menuItemText.setValue('Changed destination');
    form.onSave();
    form.onSave();
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
    form.onSave();
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
    await harness.navigateByUrl('/navigational-list/edit/second');
    const form = harness.fixture.debugElement.query(
      By.directive(MenuItemFormComponent)
    ).componentInstance as MenuItemFormComponent;
    expect(form.form.controls.menuItemText.value).toBe(
      'Second destination'
    );
    form.onCancel();
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
    const form = harness.fixture.debugElement.query(
      By.directive(MenuItemFormComponent)
    ).componentInstance as MenuItemFormComponent;
    form.form.patchValue({
      menuItemText: 'New destination',
      routePath: '/new',
      domain: 'ADMIN',
      structuralSubtype: 'NAV',
      state: 'FULL',
    });
    form.onSave();
    const request = http.expectOne('/api/navigational-list');
    expect(request.request.method).toBe('POST');
    request.flush(menuItem());
    http.expectOne('/api/navigational-list').flush([menuItem()]);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
