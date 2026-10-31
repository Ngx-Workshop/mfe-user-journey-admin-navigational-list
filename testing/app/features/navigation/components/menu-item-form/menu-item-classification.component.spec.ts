import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { MenuItemClassificationComponent } from '../../../../../../src/app/features/navigation/components/menu-item-form/menu-item-classification.component';
import { MenuItemFormService } from '../../../../../../src/app/features/navigation/utils/menu-item-form.service';
import {
  DOMAIN_OPTIONS,
  STATE_OPTIONS,
  STRUCTURAL_SUBTYPE_OPTIONS,
} from '../../../../../../src/app/features/navigation/models/menu.types';

describe('Navigation shared select policy', () => {
  let fixture: ComponentFixture<MenuItemClassificationComponent>;
  let select: MatSelect;
  let theme: string | null;
  beforeEach(async () => {
    theme = document.documentElement.getAttribute('data-ngx-theme');
    TestBed.configureTestingModule({
      imports: [MenuItemClassificationComponent],
      providers: [
        MenuItemFormService,
        provideZonelessChangeDetection(),
      ],
    });
    fixture = TestBed.createComponent(
      MenuItemClassificationComponent
    );
    fixture.componentRef.setInput(
      'form',
      TestBed.inject(MenuItemFormService).createMenuItemForm()
    );
    fixture.componentRef.setInput('domainOptions', DOMAIN_OPTIONS);
    fixture.componentRef.setInput('stateOptions', STATE_OPTIONS);
    fixture.componentRef.setInput(
      'structuralSubtypeOptions',
      STRUCTURAL_SUBTYPE_OPTIONS
    );
    fixture.componentRef.setInput('embedded', true);
    fixture.detectChanges();
    await fixture.whenStable();
    select = fixture.debugElement.query(
      By.directive(MatSelect)
    ).componentInstance;
  });
  afterEach(() => {
    if (theme === null)
      document.documentElement.removeAttribute('data-ngx-theme');
    else
      document.documentElement.setAttribute('data-ngx-theme', theme);
  });
  for (const dismissal of ['selection', 'outside click', 'Escape']) {
    it(`inherits the light scheme and retains its final fade on ${dismissal}`, async () => {
      document.documentElement.setAttribute(
        'data-ngx-theme',
        'light'
      );
      select.open();
      fixture.detectChanges();
      await fixture.whenStable();
      const panel = select.panel.nativeElement as HTMLElement;
      expect(panel.classList.contains('ngx-select-panel')).toBeTrue();
      expect(getComputedStyle(panel).colorScheme).toBe('light');
      expect(
        getComputedStyle(panel)
          .getPropertyValue('--mat-sys-primary')
          .trim()
      ).toBe('#006b70');
      panel
        .getAnimations()
        .forEach((animation) => animation.finish());
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
      if (dismissal === 'selection')
        (
          panel.querySelectorAll('mat-option')[1] as HTMLElement
        ).click();
      else if (dismissal === 'outside click')
        document
          .querySelector<HTMLElement>('.cdk-overlay-backdrop')!
          .click();
      else
        panel.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            keyCode: 27,
            bubbles: true,
          })
        );
      fixture.detectChanges();
      const exit = panel
        .getAnimations()
        .find(
          (animation) =>
            (animation as CSSAnimation).animationName ===
            '_mat-select-exit'
        );
      expect(exit).toBeDefined();
      exit!.finish();
      expect(getComputedStyle(panel).opacity).toBe('0');
      expect(
        fixture.componentInstance.form.controls.domain.value
      ).toBe(dismissal === 'selection' ? 'WORKSHOP' : '');
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve())
        )
      );
      await fixture.whenStable();
      expect(panel.isConnected).toBeFalse();
      select.open();
      fixture.detectChanges();
      await fixture.whenStable();
      const reopened = select.panel.nativeElement as HTMLElement;
      reopened
        .getAnimations()
        .forEach((animation) => animation.finish());
      expect(getComputedStyle(reopened).opacity).toBe('1');
      select.close();
    });
  }
});
