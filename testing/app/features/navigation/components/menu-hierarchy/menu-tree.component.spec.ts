import { TestBed } from '@angular/core/testing';
import { MenuTreeComponent } from '../../../../../../src/app/features/navigation/components/menu-hierarchy/menu-tree.component';
import { menuItem } from '../../menu.fixture';

describe('MenuTreeComponent', () => {
  it('renders labeled keyboard controls and emits one-based sibling positions', () => {
    const fixture = TestBed.createComponent(MenuTreeComponent);
    fixture.componentRef.setInput('listId', 'list-ADMIN-NAV-FULL');
    fixture.componentRef.setInput('items', [
      menuItem(),
      menuItem({ _id: 'second', menuItemText: 'Settings' }),
    ]);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button'
    ) as NodeListOf<HTMLButtonElement>;
    const emit = spyOn(
      fixture.componentInstance.moveRequested,
      'emit'
    );
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].getAttribute('aria-label')).toBe(
      'Move Dashboard down'
    );
    buttons[1].click();
    expect(emit).toHaveBeenCalledWith({
      item: menuItem(),
      position: 2,
    });
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(
      [...buttons].every((button) => button.disabled)
    ).toBeTrue();
  });
});
