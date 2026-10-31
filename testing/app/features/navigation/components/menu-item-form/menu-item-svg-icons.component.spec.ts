import { TestBed } from '@angular/core/testing';
import { DebugElement, getDebugNode } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { ASSET_DATA_SOURCE, Asset, AssetManagerComponent } from '@tmdjr/ngx-asset-manager';
import { of } from 'rxjs';
import { MenuItemSvgIconsComponent } from '../../../../../../src/app/features/navigation/components/menu-item-form/menu-item-svg-icons.component';
import { MenuIconPickerDialogComponent } from '../../../../../../src/app/features/navigation/components/menu-item-form/menu-icon-picker-dialog.component';
import { MenuItemFormService } from '../../../../../../src/app/features/navigation/utils/menu-item-form.service';

const image = {
  _id: 'image', name: 'Menu image', mediaType: 'image/svg+xml',
  storageStatus: 'READY', storageUrl: '/assets/menu.svg',
} as Asset;

describe('Menu icon image selection', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations(), MenuItemFormService,
      { provide: ASSET_DATA_SOURCE, useValue: {
        listAssets: () => of([image]), listFolders: () => of([]),
      } },
    ],
  }));
  const setup = () => {
    const fixture = TestBed.createComponent(MenuItemSvgIconsComponent);
    const form = TestBed.inject(MenuItemFormService).createMenuItemForm();
    form.patchValue({ navSvgPath: 'home', headerSvgPath: 'devicon-angular-plain colored' });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('embedded', true);
    fixture.detectChanges();
    return { fixture, form, dialogs: TestBed.inject(MatDialog) };
  };
  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('selects navigation images and uploaded header images without changing the other field', async () => {
    const { fixture, form, dialogs } = setup();
    for (const [field, event] of [['navSvgPath', 'assetSelected'], ['headerSvgPath', 'uploaded']] as const) {
      const button = fixture.nativeElement.querySelector(`button[aria-label="Choose ${field === 'navSvgPath' ? 'navigation' : 'header'} icon image"]`);
      button.click();
      fixture.detectChanges();
      await fixture.whenStable();
      const dialog = dialogs.openDialogs[0];
      expect(dialog.componentInstance instanceof MenuIconPickerDialogComponent).toBeTrue();
      const manager = dialog.componentRef!.location.nativeElement.querySelector('ngx-asset-manager');
      // Inspect the actual package component in the opened Material dialog.
      const managerComponent = (getDebugNode(manager) as DebugElement).componentInstance as AssetManagerComponent;
      expect(managerComponent.assetTypes()).toEqual(['image']);
      expect(managerComponent.browseFolders()).toBeTrue();
      managerComponent[event].emit(image);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(form.controls[field].value).toBe('/assets/menu.svg');
      expect(form.controls[field].dirty).toBeTrue();
      if (field === 'navSvgPath') expect(form.controls.headerSvgPath.value).toBe('devicon-angular-plain colored');
    }
    expect(TestBed.inject(MenuItemFormService).toDto({ ...form.getRawValue(), domain: 'ADMIN', structuralSubtype: 'NAV', state: 'FULL' }).headerSvgPath).toBe('/assets/menu.svg');
  });

  it('keeps values on cancel, rejects unusable assets and respects disabled controls', async () => {
    const { fixture, form, dialogs } = setup();
    fixture.componentInstance.chooseImage('navSvgPath');
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog = dialogs.openDialogs[0];
    dialog.componentInstance.selectImage({ ...image, storageStatus: 'PENDING_STORAGE' } as Asset);
    fixture.detectChanges();
    expect(dialog.componentInstance.error()).toContain('no usable URL');
    expect(dialogs.openDialogs.length).toBe(1);
    dialog.close();
    await fixture.whenStable();
    expect(form.controls.navSvgPath.value).toBe('home');
    expect(form.controls.navSvgPath.pristine).toBeTrue();
    form.disable();
    fixture.componentInstance.chooseImage('navSvgPath');
    expect(dialogs.openDialogs.length).toBe(0);
    form.enable();
    fixture.componentInstance.chooseImage('headerSvgPath');
    fixture.detectChanges();
    await fixture.whenStable();
    form.disable();
    dialogs.openDialogs[0].close('/assets/ignored.png');
    await fixture.whenStable();
    expect(form.controls.headerSvgPath.value).toBe('devicon-angular-plain colored');
  });
});
