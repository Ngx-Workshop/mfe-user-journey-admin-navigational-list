import { TestBed } from '@angular/core/testing';
import { MenuManagenmentActions } from '../../../../../src/app/features/navigation/components/menu-managenment-actions.component';

describe('Shared navigation action bar adoption', () => {
  it('retains the shared live region and existing error recovery instructions without a retry button', async () => {
    TestBed.configureTestingModule({
      imports: [MenuManagenmentActions],
    });
    const fixture = TestBed.createComponent(MenuManagenmentActions);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const live = root.querySelector(
      'ngx-save-feedback [role=status]'
    )!;
    expect(live.getAttribute('aria-atomic')).toBe('true');
    for (const [status, text] of [
      ['saving', 'Saving Reports…'],
      ['saved', 'Changes saved · Reports'],
      ['error', 'Could not save Reports. Try the action again.'],
    ]) {
      fixture.componentRef.setInput('saveNotification', {
        status,
        name: 'Reports',
      });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        root.querySelector('ngx-save-feedback [role=status]')
      ).toBe(live);
      expect(live.textContent?.trim()).toBe(text);
    }
    expect(root.querySelector('ngx-save-feedback button')).toBeNull();
    fixture.componentRef.setInput('saveNotification', null);
    fixture.detectChanges();
    expect(live.textContent?.trim()).toBe('');
  });

  it('reports the shared bar height and respects the existing standalone offset override', async () => {
    TestBed.configureTestingModule({
      imports: [MenuManagenmentActions],
    });
    const fixture = TestBed.createComponent(MenuManagenmentActions);
    const height = jasmine.createSpy('height');
    fixture.componentInstance.heightChange.subscribe(height);
    const root = fixture.nativeElement as HTMLElement;
    root.style.setProperty('--menu-toolbar-top', '0px');
    fixture.detectChanges();
    await fixture.whenStable();
    const bar = root.querySelector('ngx-action-bar') as HTMLElement;
    expect(getComputedStyle(bar).position).toBe('sticky');
    expect(getComputedStyle(bar).top).toBe('0px');
    expect(height).toHaveBeenCalledWith(
      Math.ceil(bar.getBoundingClientRect().height)
    );
    expect(
      root
        .querySelector('ngx-inline-status')
        ?.getAttribute('data-tone')
    ).toBe('neutral');
  });
});
