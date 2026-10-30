import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import App from '../../../../../../src/app/app';
import { MenuWorkspaceResultsComponent } from '../../../../../../src/app/features/navigation/components/menu-list/menu-workspace-results.component';
import { menuItem } from '../../menu.fixture';
const parent = menuItem({ _id: 'parent', menuItemText: 'Workspace' });
const child = menuItem({
  _id: 'child',
  menuItemText: 'Child',
  parentId: 'parent',
});
const other = menuItem({
  _id: 'other',
  menuItemText: 'Settings',
  sortId: 2,
});
const rows = [parent, child, other];

describe('Unified catalog interactions', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const setup = async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    http.expectOne('/api/navigational-list').flush(rows);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  };
  it('retains complete siblings after a failed reorder and supports retry', async () => {
    const fixture = await setup();
    const down = fixture.nativeElement.querySelector(
      'button[aria-label="Move Workspace down"]'
    ) as HTMLButtonElement;
    down.click();
    fixture.detectChanges();
    expect(down.disabled).toBeTrue();
    const request = http.expectOne('/api/navigational-list/sort');
    expect(JSON.parse(JSON.stringify(request.request.body))).toEqual({
      _id: 'parent',
      sortId: 2,
    });
    request.flush('failed', { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('ngx-menu-tree-row')
        .length
    ).toBe(3);
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).not.toBeNull();
    expect(down.disabled).toBeFalse();
    down.click();
    http.expectOne('/api/navigational-list/sort').flush({});
    http
      .expectOne('/api/navigational-list')
      .flush([
        { ...other, sortId: 1 },
        { ...parent, sortId: 2 },
        child,
      ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('ngx-menu-tree-row')
        .textContent
    ).toContain('Settings');
  });
  it('blocks filtered move/drop intent while keeping matched ancestors and edit actions visible', async () => {
    const fixture = await setup();
    const search = fixture.nativeElement.querySelector(
      'ngx-menu-filters input'
    ) as HTMLInputElement;
    search.value = 'Child';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(
      'Ancestor context'
    );
    expect(
      fixture.nativeElement.querySelectorAll('ngx-menu-tree-row')
        .length
    ).toBe(2);
    const result = fixture.debugElement.query(
      By.directive(MenuWorkspaceResultsComponent)
    ).componentInstance as MenuWorkspaceResultsComponent;
    result.onMove({ item: parent, position: 2 });
    result.onDrop({
      item: { data: parent },
      container: { id: 'list-ADMIN-NAV-FULL' },
      currentIndex: 1,
    } as Parameters<typeof result.onDrop>[0]);
    http.expectNone('/api/navigational-list/sort');
    expect(
      (
        fixture.nativeElement.querySelector(
          'button[aria-label="Edit Child"]'
        ) as HTMLButtonElement
      ).disabled
    ).toBeFalse();
  });
  it('archives from the tree action menu and restores from the same workspace', async () => {
    const fixture = await setup();
    const menu = await TestbedHarnessEnvironment.loader(
      fixture
    ).getHarness(
      MatMenuHarness.with({
        selector: '[aria-label="Actions for Child"]',
      })
    );
    await menu.open();
    await menu.clickItem({ text: /Archive/ });
    http
      .expectOne('/api/navigational-list/child/archive')
      .flush({ ...child, archived: true });
    http
      .expectOne('/api/navigational-list')
      .flush([parent, { ...child, archived: true }, other]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('ngx-menu-tree-row')
        .length
    ).toBe(2);
    (
      fixture.nativeElement.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement
    ).click();
    fixture.detectChanges();
    await fixture.whenStable();
    const restore = fixture.nativeElement.querySelector(
      'button[aria-label="Restore Child"]'
    ) as HTMLButtonElement;
    expect(restore).not.toBeNull();
    restore.click();
    http
      .expectOne('/api/navigational-list/child/unarchive')
      .flush(child);
    http.expectOne('/api/navigational-list').flush(rows);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelectorAll('ngx-menu-tree-row')
        .length
    ).toBe(3);
    expect(
      fixture.nativeElement.querySelector('ngx-menu-item-card')
    ).toBeNull();
  });
});
