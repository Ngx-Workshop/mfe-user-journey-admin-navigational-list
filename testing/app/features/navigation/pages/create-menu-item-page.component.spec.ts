import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatStepperHarness } from '@angular/material/stepper/testing';
import { Routes } from '../../../../../src/app/app.routes';
import { CreateMenuItemPage } from '../../../../../src/app/features/navigation/pages/create-menu-item-page.component';
import { mfeRemote } from '../mfe.fixture';
import { menuItem } from '../menu.fixture';
const url = '/api/navigational-list';
const parent = menuItem();

describe('Menu creation wizard', () => {
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
  const setup = async (items = [parent], path = '/create') => {
    const harness = await RouterTestingHarness.create(path);
    http.expectOne(url).flush(items);
    harness.detectChanges();
    await harness.fixture.whenStable();
    const create = harness.fixture.debugElement.query(
      By.directive(CreateMenuItemPage)
    ).componentInstance as CreateMenuItemPage;
    const stepper = await TestbedHarnessEnvironment.loader(
      harness.fixture
    ).getHarness(MatStepperHarness);
    return { harness, model: create.model, stepper };
  };
  it('enforces linear step validation and retains values through backward navigation', async () => {
    const { harness, model, stepper } = await setup();
    const steps = await stepper.getSteps();
    const next = () =>
      harness.routeNativeElement!.querySelector(
        '.menu-create__actions button'
      ) as HTMLButtonElement;
    const controls = (group: number) =>
      Array.from(
        harness
          .routeNativeElement!.querySelectorAll(
            '.menu-create__fields'
          )
          [group].querySelectorAll('[formControlName]')
      ).map((element) => element.getAttribute('formControlName'));
    expect(controls(0)).toEqual([
      'menuItemText',
      'domain',
      'role',
      'structuralSubtype',
      'state',
    ]);
    expect(next().disabled).toBeTrue();
    await steps[2].select();
    expect(await steps[0].isSelected()).toBeTrue();
    model.form.patchValue({
      menuItemText: 'Destination',
      domain: 'ADMIN',
      structuralSubtype: 'NAV',
      state: 'FULL',
      role: 'admin',
    });
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Destination')]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(next().disabled).toBeFalse();
    next().click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(await steps[1].isSelected()).toBeTrue();
    expect(controls(1)).toEqual(['routePath', 'parentId', 'sortId']);
    expect(next().disabled).toBeTrue();
    model.form.patchValue({
      routePath: 'destination',
      parentId: parent._id,
      sortId: 3,
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    next().click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(await steps[2].isSelected()).toBeTrue();
    expect(controls(2)).toEqual([
      'navSvgPath',
      'headerSvgPath',
      'description',
    ]);
    expect(
      harness.routeNativeElement!.querySelector(
        '[formControlName="archived"]'
      )
    ).toBeNull();
    model.form.controls.sortId.setValue(-1);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(next().disabled).toBeTrue();
    model.form.patchValue({
      sortId: 3,
      description: 'Retained description',
    });
    await steps[0].select();
    expect(model.form.controls.parentId.value).toBe(parent._id);
    expect(model.form.controls.description.value).toBe(
      'Retained description'
    );
    model.form.controls.menuItemText.setValue('');
    harness.detectChanges();
    await harness.fixture.whenStable();
    await steps[2].select();
    expect(await steps[0].isSelected()).toBeTrue();
    http.expectNone((request) => request.method === 'POST');
  });
  it('offers scoped sibling positions, resets placement and reflects the name in the heading', async () => {
    const first = menuItem({ _id: 'first', parentId: parent._id, menuItemText: 'First child', sortId: 1 });
    const second = menuItem({ _id: 'second', parentId: parent._id, menuItemText: 'Second child', sortId: 2 });
    const { harness, model, stepper } = await setup([
      parent, second, first,
      menuItem({ _id: 'nested', parentId: first._id }),
      menuItem({ _id: 'archived', parentId: parent._id, archived: true }),
      menuItem({ _id: 'other-state', parentId: parent._id, state: 'COMPACT' }),
    ]);
    model.form.patchValue({ menuItemText: 'Reports', domain: 'ADMIN', routePath: 'reports', structuralSubtype: 'NAV', state: 'FULL', parentId: parent._id });
    harness.detectChanges();
    await harness.fixture.whenStable();
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Reports')]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Creating menu item: Reports');
    expect(model.positionOptions()).toEqual([
      { id: 'first', label: 'First child', value: 1.5 },
      { id: 'second', label: 'Second child', value: 3 },
    ]);
    const steps = await stepper.getSteps();
    await steps[1].select();
    const position = await TestbedHarnessEnvironment.loader(harness.fixture)
      .getHarness(MatSelectHarness.with({ selector: '[formControlName="sortId"]' }));
    await position.open();
    expect(await Promise.all((await position.getOptions()).map((option) => option.getText())))
      .toEqual(['None', 'First child', 'Second child']);
    await position.clickOptions({ text: 'First child' });
    expect(model.form.controls.sortId.value).toBe(1.5);
    await steps[2].select();
    model.submit();
    const request = http.expectOne(url);
    expect(request.request.body.sortId).toBe(1.5);
    expect(request.request.body.parentId).toBe(parent._id);
    request.flush('failed', { status: 500, statusText: 'Error' });
    model.form.controls.parentId.setValue(first._id);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.form.controls.sortId.value).toBe(0);
    expect(model.positionOptions().map((option) => option.id)).toEqual(['nested']);
    model.form.controls.parentId.setValue('');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.positionOptions().map((option) => option.id)).toEqual([parent._id]);
    model.form.controls.sortId.setValue(2);
    model.form.controls.domain.setValue('WORKSHOP');
    http.expectOne('/api/mfe-remotes/domain/workshop').flush([]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.form.controls.sortId.value).toBe(0);
    expect(model.positionOptions()).toEqual([]);
  });
  it('submits only on the final step, retains failed entries and prevents duplicate creation', async () => {
    const { harness, model, stepper } = await setup();
    model.form.patchValue({
      menuItemText: 'New destination',
      domain: 'ADMIN',
      routePath: 'new',
      structuralSubtype: 'NAV',
      state: 'FULL',
      parentId: parent._id,
      role: 'admin',
      sortId: 2,
      navSvgPath: 'M0 0',
      tooltipText: 'New tooltip',
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('New')]);
    harness.detectChanges();
    const form = harness.routeNativeElement!.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
    http.expectNone((request) => request.method === 'POST');
    const steps = await stepper.getSteps();
    await steps[1].select();
    await steps[2].select();
    harness.detectChanges();
    await harness.fixture.whenStable();
    const submit = harness.routeNativeElement!.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(submit.form?.id).toBe(model.editor.formId);
    submit.click();
    submit.click();
    const first = http.expectOne(url);
    expect(first.request.method).toBe('POST');
    expect(first.request.body.parentId).toBe(parent._id);
    expect(first.request.body.routePath).toBe('new');
    expect(first.request.body.role).toBe('admin');
    expect(first.request.body.navSvgPath).toBe('M0 0');
    expect(
      await TestBed.inject(Router).navigateByUrl('/')
    ).toBeFalse();
    first.flush('failed', { status: 500, statusText: 'Error' });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.step()).toBe(2);
    expect(model.form.controls.menuItemText.value).toBe(
      'New destination'
    );
    expect(model.form.controls.parentId.value).toBe(parent._id);
    expect(submit.disabled).toBeFalse();
    submit.click();
    const retry = http.expectOne(url);
    expect(retry.request.body.menuItemText).toBe('New destination');
    retry.flush(
      menuItem({ _id: 'new', menuItemText: 'New destination' })
    );
    http.expectOne(url).flush([parent, menuItem({ _id: 'new' })]);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
  });
  it('edits through the shared steps, retains placement and retries PATCH without creating', async () => {
    const existing = menuItem({ _id: 'edit-item', routePath: 'dashboard', parentId: parent._id,
      sortId: 7, archived: true, tooltipText: 'Original tooltip', navSvgPath: 'home' });
    const { harness, model, stepper } = await setup([parent, existing], '/edit/edit-item');
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Dashboard')]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.textContent).toContain('Editing menu item: Dashboard');
    expect(model.form.controls.sortId.value).toBe(7);
    expect(model.form.controls.archived.value).toBeTrue();
    expect(model.positionOptions().map((option) => option.id)).toEqual(['current-position']);
    const archive = harness.routeNativeElement!.querySelector('mat-card-header mat-checkbox input') as HTMLInputElement;
    const panel = () => harness.routeNativeElement!.querySelector('ngx-panel .frame')!;
    expect(archive.checked).toBeTrue();
    expect(panel().getAttribute('data-tone')).toBe('secondary');
    archive.click();
    harness.detectChanges();
    expect(model.form.controls.archived.value).toBeFalse();
    expect(panel().getAttribute('data-tone')).toBe('primary');
    http.expectOne(`${url}/${existing._id}/unarchive`).flush({ ...existing, archived: false });
    http.expectOne(url).flush([parent, { ...existing, archived: false }]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    archive.click();
    harness.detectChanges();
    expect(panel().getAttribute('data-tone')).toBe('secondary');
    http.expectOne(`${url}/${existing._id}/archive`).flush(existing);
    http.expectOne(url).flush([parent, existing]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.editor.parentOptions().some((option) => option.value === existing._id)).toBeFalse();
    expect(harness.routeNativeElement!.querySelector('mat-card-header mat-checkbox')).not.toBeNull();
    model.submit();
    http.expectNone((request) => request.method === 'PATCH');
    const steps = await stepper.getSteps();
    await steps[1].select();
    const position = await TestbedHarnessEnvironment.loader(harness.fixture)
      .getHarness(MatSelectHarness.with({ selector: '[formControlName="sortId"]' }));
    expect(await position.getValueText()).toBe('Current position');
    await steps[2].select();
    model.form.controls.menuItemText.setValue('Updated dashboard');
    harness.detectChanges();
    await harness.fixture.whenStable();
    const submit = harness.routeNativeElement!.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit.textContent).toContain('Save changes');
    expect(harness.routeNativeElement!.querySelector('mat-card-header mat-checkbox')).not.toBeNull();
    submit.click();
    submit.click();
    harness.detectChanges();
    expect(archive.disabled).toBeTrue();
    const first = http.expectOne(`${url}/${existing._id}`);
    expect(first.request.method).toBe('PATCH');
    expect(first.request.body).toEqual(jasmine.objectContaining({
      menuItemText: 'Updated dashboard', sortId: 7, parentId: parent._id,
      archived: true, tooltipText: 'Original tooltip', navSvgPath: 'home',
    }));
    expect(await TestBed.inject(Router).navigateByUrl('/')).toBeFalse();
    first.flush('failed', { status: 500, statusText: 'Error' });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.step()).toBe(2);
    expect(model.form.controls.menuItemText.value).toBe('Updated dashboard');
    expect(submit.disabled).toBeFalse();
    submit.click();
    http.expectOne(`${url}/${existing._id}`).flush(existing);
    http.expectOne(url).flush([parent, existing]);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/');
    http.expectNone((request) => request.method === 'POST');
  });

  it('recreates the edit wizard for another route id and handles a missing item', async () => {
    const first = menuItem({ _id: 'first', routePath: 'dashboard', sortId: 4 });
    const second = menuItem({ _id: 'second', menuItemText: 'Second', routePath: 'dashboard', sortId: 8 });
    const { harness, model } = await setup([first, second], '/edit/first');
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Dashboard')]);
    model.form.controls.menuItemText.setValue('Unsaved first');
    await harness.navigateByUrl('/edit/second');
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Dashboard')]);
    harness.detectChanges();
    const next = harness.fixture.debugElement.query(By.directive(CreateMenuItemPage)).componentInstance as CreateMenuItemPage;
    expect(next.model).not.toBe(model);
    expect(next.model.form.controls.menuItemText.value).toBe('Second');
    expect(next.model.form.controls.sortId.value).toBe(8);
    expect(next.model.step()).toBe(0);
    await harness.navigateByUrl('/edit/missing');
    expect(harness.routeNativeElement!.textContent).toContain('Menu item not found');
    expect(harness.fixture.debugElement.query(By.directive(CreateMenuItemPage))).toBeNull();
  });

  it('autosaves archive changes with action-bar feedback while preserving invalid drafts and retrying failures', async () => {
    const existing = menuItem({ _id: 'edit-item', routePath: 'dashboard' });
    const { harness, model } = await setup([existing], '/edit/edit-item');
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote('Dashboard')]);
    model.form.patchValue({ menuItemText: '', description: 'Unsaved description' });
    harness.detectChanges();
    const checkbox = harness.routeNativeElement!.querySelector('mat-card-header mat-checkbox input') as HTMLInputElement;
    const notification = () => harness.routeNativeElement!.querySelector('ngx-menu-managenment-actions')!.textContent!;
    checkbox.click();
    harness.detectChanges();
    const request = http.expectOne(`${url}/${existing._id}/archive`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    expect(notification()).toContain('Saving');
    expect(checkbox.disabled).toBeTrue();
    model.setArchived(false);
    http.expectNone(`${url}/${existing._id}/unarchive`);
    expect(await TestBed.inject(Router).navigateByUrl('/')).toBeFalse();
    request.flush({ ...existing, archived: true });
    http.expectOne(url).flush([{ ...existing, archived: true }]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(notification()).toContain('Changes saved');
    expect(TestBed.inject(Router).url).toBe('/edit/edit-item');
    expect(model.form.controls.menuItemText.value).toBe('');
    expect(model.form.controls.description.value).toBe('Unsaved description');
    expect(model.step()).toBe(0);
    checkbox.click();
    harness.detectChanges();
    http.expectOne(`${url}/${existing._id}/unarchive`)
      .flush('failed', { status: 500, statusText: 'Error' });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.archived()).toBeTrue();
    expect(checkbox.checked).toBeTrue();
    expect(harness.routeNativeElement!.querySelector('ngx-panel .frame')!.getAttribute('data-tone')).toBe('secondary');
    expect(model.editor.store.saveNotification()?.status).toBe('error');
    expect(checkbox.disabled).toBeFalse();
    checkbox.click();
    harness.detectChanges();
    http.expectOne(`${url}/${existing._id}/unarchive`).flush(existing);
    http.expectOne(url).flush([existing]);
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(model.archived()).toBeFalse();
    expect(notification()).toContain('Changes saved');
    expect(model.form.controls.description.value).toBe('Unsaved description');
    http.expectNone(`${url}/${existing._id}`);
  });

});
