import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

/** Resolve paths against the destination app, rather than the admin shell. */
export function menuRouteUrl(item: Pick<MenuItemDto, 'domain' | 'routePath'>): string {
  const base = item.domain === 'ADMIN' ? 'https://admin.ngx-workshop.io/' : 'https://beta.ngx-workshop.io/';
  return /^https?:\/\//i.test(item.routePath) ? item.routePath : base + item.routePath.replace(/^\/+/, '');
}
