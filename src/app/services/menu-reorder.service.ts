import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { inject, Injectable } from '@angular/core';
import {
  MenuItemDto,
  SortMenuItemDto,
} from '@tmdjr/service-navigational-list-contracts';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { MenuApiService } from './menu-api.service';

@Injectable({ providedIn: 'root' })
export class MenuReorderService {
  private menuApiService = inject(MenuApiService);
  private isDragging = new BehaviorSubject(false);
  isDragging$ = this.isDragging.asObservable();

  private updateMenuItemSortAndParent(
    event: CdkDragDrop<MenuItemDto[], MenuItemDto[], any>,
    menuItem: MenuItemDto
  ) {
    menuItem.sortId = event.currentIndex + 1;

    const idPattern = /list-([A-Z]+)-([A-Z]+)-([A-Z]+)(-.+)?/;
    const match = event.container.id.match(idPattern);
    if (match) {
      const domain = match[1];
      const structuralSubtype = match[2];
      const state = match[3];
      const parentIdPart = match[4]; // This will be something like -68d097bb26641456d521c398-68d0a3e126641456d521c45b
      if (parentIdPart) {
        const parentIds = parentIdPart
          .split('-')
          .filter((part) => part.length > 0);
        if (parentIds.length > 0) {
          const newParentId = parentIds[parentIds.length - 1];
          menuItem.parentId = newParentId;
        } else {
          menuItem.parentId = undefined;
        }
      } else {
        menuItem.parentId = undefined;
      }
      menuItem.domain = domain as MenuItemDto['domain'];
      menuItem.structuralSubtype =
        structuralSubtype as MenuItemDto['structuralSubtype'];
      menuItem.state = state as MenuItemDto['state'];
    } else {
      console.warn(
        'Could not parse container id:',
        event.container.id
      );
    }

    const { _id, parentId, sortId }: SortMenuItemDto = menuItem;
    console.log(
      'Updating menu item:',
      menuItem._id,
      'to parent:',
      menuItem.parentId,
      'with sortId:',
      menuItem.sortId
    );
    lastValueFrom(
      this.menuApiService.reorderMenuItems$({ _id, parentId, sortId })
    );
  }

  onDragStarted() {
    this.isDragging.next(true);
  }

  onDragEnded() {
    this.isDragging.next(false);
  }

  drop(event: CdkDragDrop<MenuItemDto[]>) {
    const menuItem = structuredClone(event.item.data) as MenuItemDto;
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.updateMenuItemSortAndParent(event, menuItem);
  }
}
