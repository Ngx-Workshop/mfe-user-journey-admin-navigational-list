import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideRouter } from '@angular/router';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestBed } from '@angular/core/testing';
import App from '../../src/app/app';
import { MatDialog, MatDialogState } from '@angular/material/dialog';
import { mfeRemote } from './features/navigation/mfe.fixture';
import { MenuItemFormComponent } from '../../src/app/features/navigation/components/menu-item-form/menu-item-form.component';
import { MenuStore } from '../../src/app/features/navigation/state/menu.store';
import { menuItem } from './features/navigation/menu.fixture';

describe('App navigation journey', () => {
  it('renders navigation management and propagates archived filtering without another request', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    http.expectOne('/api/navigational-list').flush([
      menuItem(),
      menuItem({
        _id: 'archived',
        menuItemText: 'Archived link',
        archived: true,
      }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('h1').textContent
    ).toContain('Navigation catalog');
    expect(fixture.nativeElement.textContent).toContain('Dashboard');
    expect(fixture.nativeElement.textContent).not.toContain(
      'Archived link'
    );
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;
    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(
      'Archived link'
    );
    http.verify();
  });
  it('shows a catalog-wide unplaced status through filtering, refreshes and retained-data errors', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    const status = () => fixture.nativeElement.querySelector('.menu-managenment-actions__unplaced') as HTMLElement;
    const text = () => status().textContent!.replace(/\s+/g, ' ').trim();
    expect(text()).toBe('Unplaced destinations: —');
    expect(status().getAttribute('role')).toBe('status');
    expect(status().getAttribute('aria-live')).toBe('polite');
    const orphan = menuItem({ _id: 'orphan', parentId: 'missing', menuItemText: 'Orphan' });
    const archived = menuItem({ _id: 'archived-orphan', parentId: 'missing', archived: true });
    http.expectOne('/api/navigational-list').flush([menuItem(), orphan, archived]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(text()).toBe('1 unplaced destination');
    expect(status().classList.contains('menu-managenment-actions__unplaced--active')).toBeTrue();
    const search = fixture.nativeElement.querySelector('ngx-menu-filters input') as HTMLInputElement;
    search.value = 'Dashboard';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(text()).toBe('1 unplaced destination');
    const store = TestBed.inject(MenuStore);
    store.refresh();
    http.expectOne('/api/navigational-list').flush([
      menuItem(), orphan, archived,
      menuItem({ _id: 'cycle-a', parentId: 'cycle-b' }),
      menuItem({ _id: 'cycle-b', parentId: 'cycle-a' }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(text()).toBe('3 unplaced destinations');
    store.refresh();
    http.expectOne('/api/navigational-list').flush('failed', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(text()).toBe('3 unplaced destinations');
    store.refresh();
    http.expectOne('/api/navigational-list').flush([menuItem(), { ...orphan, parentId: undefined }, archived]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(text()).toBe('0 unplaced destinations');
    expect(status().classList.contains('menu-managenment-actions__unplaced--active')).toBeFalse();
    http.verify();
  });
  it('filters by a named role and offers reset for no matches', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    http.expectOne('/api/navigational-list').flush([
      menuItem(),
      menuItem({
        _id: 'admin',
        menuItemText: 'Administration',
        role: 'admin',
      }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const selects = await loader.getAllHarnesses(
      MatSelectHarness.with({ ancestor: 'ngx-menu-filters' })
    );
    const role = selects[3];
    await role.open();
    await role.clickOptions({ text: 'Admin' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll(
        'ngx-menu-tree-row, ngx-menu-item-card'
      ).length
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelector(
        'ngx-menu-tree-row, ngx-menu-item-card'
      ).textContent
    ).toContain('Administration');
    const search = fixture.nativeElement.querySelector(
      'ngx-menu-filters input'
    ) as HTMLInputElement;
    search.value = 'missing';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('ngx-menu-empty-state')
        .textContent
    ).toContain('No matching');
    const reset = fixture.nativeElement.querySelector(
      'ngx-menu-empty-state button'
    ) as HTMLButtonElement;
    reset.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll(
        'ngx-menu-tree-row, ngx-menu-item-card'
      ).length
    ).toBe(2);
    http.verify();
  });

  it('associates the dialog footer with its form and submits a valid item once', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    http.expectOne('/api/navigational-list').flush([]);
    const dialog = TestBed.inject(MatDialog).open(
      MenuItemFormComponent,
      {
        data: { mode: 'create' },
        enterAnimationDuration: 0,
        exitAnimationDuration: 0,
      }
    );
    fixture.detectChanges();
    await fixture.whenStable();
    dialog.componentInstance.form.patchValue({
      menuItemText: 'New destination',
      domain: 'ADMIN',
      routePath: 'new',
      structuralSubtype: 'NAV',
      state: 'FULL',
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const submit = document.querySelector(
      '.cdk-overlay-container button[type="submit"]'
    ) as HTMLButtonElement;
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('New')]);
    fixture.detectChanges();
    expect(submit.form?.id).toBe(dialog.componentInstance.vm.formId);
    expect(submit.disabled).toBeFalse();
    submit.click();
    const request = http.expectOne('/api/navigational-list');
    expect(request.request.method).toBe('POST');
    expect(request.request.body.menuItemText).toBe('New destination');
    expect(request.request.body.routePath).toBe('new');
    request.flush(menuItem({ menuItemText: 'New destination' }));
    http
      .expectOne('/api/navigational-list')
      .flush([menuItem({ menuItemText: 'New destination' })]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(dialog.getState()).not.toBe(MatDialogState.OPEN);
    http.verify();
  });

  it('distinguishes a failed initial load from an empty catalog and supports retry', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    http
      .expectOne('/api/navigational-list')
      .flush('failed', { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
        .textContent
    ).toContain('Failed to load');
    expect(
      fixture.nativeElement.querySelector('ngx-menu-empty-state')
    ).toBeNull();
    const retry = [
      ...(fixture.nativeElement.querySelectorAll(
        'button'
      ) as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.trim() === 'Retry')!;
    retry.click();
    http.expectOne('/api/navigational-list').flush([]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('ngx-menu-empty-state')
    ).not.toBeNull();
    http.verify();
  });

  it('renders canonical statistics and refresh inside the Filter console', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    await fixture.whenStable();
    http.expectOne('/api/navigational-list').flush([menuItem()]);
    fixture.detectChanges();
    await fixture.whenStable();
    const stats = fixture.nativeElement.querySelector(
      'ngx-menu-filters ngx-panel ngx-menu-statistics'
    );
    expect(stats).not.toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('ngx-menu-statistics')
        .length
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelector(
        '.menu-management > ngx-menu-statistics'
      )
    ).toBeNull();
    const search = fixture.nativeElement.querySelector(
      'ngx-menu-filters input'
    ) as HTMLInputElement;
    search.value = 'No matching destination';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(stats.querySelector('dd').textContent.trim()).toBe('1');
    expect(
      fixture.nativeElement.querySelector('ngx-menu-empty-state')
    ).not.toBeNull();
    const store = TestBed.inject(MenuStore);
    expect(
      fixture.nativeElement.querySelectorAll(
        'ngx-menu-statistics dl > div'
      ).length
    ).toBe(3);
    const refresh = fixture.nativeElement.querySelector(
      'button[aria-label="Refresh catalog"]'
    ) as HTMLButtonElement;
    refresh.click();
    http
      .expectOne('/api/navigational-list')
      .flush([menuItem({ archived: true })]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(store.statistics()[2].value).toBe(1);
    http.verify();
  });
});
