import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { createMenuRouteOptions } from '../../../../../src/app/features/navigation/view-models/menu-route-options';
import { MenuItemFormService } from '../../../../../src/app/features/navigation/utils/menu-item-form.service';
import { MenuItemBasicInfoComponent } from '../../../../../src/app/features/navigation/components/menu-item-form/menu-item-basic-info.component';
import { mfeRemote } from '../mfe.fixture';

describe('Domain route choices', () => {
  let http: HttpTestingController;
  const setup = (
    domain: 'ADMIN' | 'WORKSHOP' | '' = '',
    routePath = ''
  ) => {
    const form = TestBed.inject(
      MenuItemFormService
    ).createMenuItemForm();
    form.patchValue({ domain, routePath });
    const routes = TestBed.runInInjectionContext(() =>
      createMenuRouteOptions(form)
    );
    return { form, routes };
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MenuItemFormService,
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('requests the chosen domain, excludes structural records and uses exactly the shell slug', () => {
    const { form, routes } = setup();
    expect(routes.state().status).toBe('idle');
    http.expectNone((request) =>
      request.url.startsWith('/api/mfe-remotes')
    );
    form.controls.domain.setValue('ADMIN');
    expect(routes.state().status).toBe('loading');
    http
      .expectOne('/api/mfe-remotes/domain/admin')
      .flush([
        mfeRemote('  Coding   Labs!  '),
        mfeRemote('Header', { type: 'structural' }),
        mfeRemote('Coding Labs!'),
        mfeRemote('   '),
      ]);
    expect(routes.state().options).toEqual([
      { label: 'Coding Labs!', value: 'coding-labs!' },
    ]);
    form.controls.routePath.setValue('Coding Labs!');
    expect(form.controls.routePath.invalid).toBeTrue();
    form.controls.routePath.setValue('coding-labs!');
    expect(form.controls.routePath.valid).toBeTrue();
    form.controls.routePath.setValue('/coding-labs!');
    expect(form.controls.routePath.invalid).toBeTrue();
  });

  it('cancels obsolete domain requests, clears stale selections and revalidates against the new domain', () => {
    const { form, routes } = setup('ADMIN', 'dashboard');
    const stale = http.expectOne('/api/mfe-remotes/domain/admin');
    form.controls.domain.setValue('WORKSHOP');
    expect(stale.cancelled).toBeTrue();
    expect(form.controls.routePath.value).toBe('');
    http
      .expectOne('/api/mfe-remotes/domain/workshop')
      .flush([mfeRemote('Learning')]);
    form.controls.routePath.setValue('dashboard');
    expect(form.controls.routePath.invalid).toBeTrue();
    form.controls.routePath.setValue('learning');
    expect(form.controls.routePath.valid).toBeTrue();
    expect(
      routes.state().options.map((option) => option.value)
    ).toEqual(['learning']);
  });

  it('retains existing edits through loading and failure, blocks saving and permits retry and empty results', () => {
    const { form, routes } = setup('ADMIN', 'dashboard');
    expect(form.controls.routePath.value).toBe('dashboard');
    expect(form.controls.routePath.invalid).toBeTrue();
    http
      .expectOne('/api/mfe-remotes/domain/admin')
      .flush('failed', { status: 503, statusText: 'Unavailable' });
    expect(routes.state().status).toBe('error');
    expect(form.controls.routePath.value).toBe('dashboard');
    routes.reload();
    http
      .expectOne('/api/mfe-remotes/domain/admin')
      .flush([mfeRemote()]);
    expect(form.controls.routePath.valid).toBeTrue();
    routes.reload();
    http.expectOne('/api/mfe-remotes/domain/admin').flush([]);
    expect(routes.state()).toEqual({ status: 'ready', options: [] });
    expect(form.controls.routePath.invalid).toBeTrue();
  });

  it('searches actual autocomplete options by name, stores a slug and rejects arbitrary text', async () => {
    const { form, routes } = setup('ADMIN');
    http
      .expectOne('/api/mfe-remotes/domain/admin')
      .flush([mfeRemote('Coding Labs'), mfeRemote('Dashboard')]);
    const fixture = TestBed.createComponent(
      MenuItemBasicInfoComponent
    );
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('routeState', routes.state());
    fixture.componentRef.setInput('fields', ['routePath']);
    fixture.detectChanges();
    const autocomplete = await TestbedHarnessEnvironment.loader(
      fixture
    ).getHarness(MatAutocompleteHarness);
    const showRoutes = fixture.nativeElement.querySelector('button[aria-label="Show available routes"]') as HTMLButtonElement;
    expect(showRoutes.disabled).toBeFalse();
    showRoutes.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await autocomplete.isOpen()).toBeTrue();
    expect((await autocomplete.getOptions()).length).toBe(2);
    await autocomplete.enterText('Coding');
    expect(
      await Promise.all(
        (await autocomplete.getOptions()).map((option) =>
          option.getText()
        )
      )
    ).toEqual(['Coding Labs (coding-labs)']);
    expect(
      document
        .querySelector('.mat-mdc-autocomplete-panel')
        ?.classList.contains('ngx-design-system-overlay')
    ).toBeTrue();
    await autocomplete.selectOption({
      text: 'Coding Labs (coding-labs)',
    });
    expect(form.controls.routePath.value).toBe('coding-labs');
    expect(form.controls.routePath.valid).toBeTrue();
    await autocomplete.enterText('Arbitrary route');
    await autocomplete.blur();
    expect(form.controls.routePath.valid).toBeFalse();
  });
  it('keeps the route label above a prefilled value before focus and through route loading', async () => {
    const { form, routes } = setup('ADMIN', 'dashboard');
    const fixture = TestBed.createComponent(MenuItemBasicInfoComponent);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('fields', ['routePath']);
    fixture.componentRef.setInput('routeState', routes.state());
    fixture.detectChanges();
    const field = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatFormFieldHarness);
    expect(await field.isLabelFloating()).toBeTrue();
    http.expectOne('/api/mfe-remotes/domain/admin').flush([mfeRemote()]);
    fixture.componentRef.setInput('routeState', routes.state());
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('dashboard');
    expect(document.activeElement).not.toBe(input);
    expect(await field.isLabelFloating()).toBeTrue();
  });

});
