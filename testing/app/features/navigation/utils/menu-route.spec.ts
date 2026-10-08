import { menuRouteUrl } from '../../../../../src/app/features/navigation/utils/menu-route';

describe('menuRouteUrl', () => {
  it('opens workshop paths in the workshop and admin paths in admin', () => {
    expect(menuRouteUrl({ domain: 'WORKSHOP', routePath: '/learning' })).toBe('https://beta.ngx-workshop.io/learning');
    expect(menuRouteUrl({ domain: 'ADMIN', routePath: 'users' })).toBe('https://admin.ngx-workshop.io/users');
  });
  it('preserves explicit http destinations and keeps other strings within the app', () => {
    expect(menuRouteUrl({ domain: 'ADMIN', routePath: 'https://example.com/help' })).toBe('https://example.com/help');
    expect(menuRouteUrl({ domain: 'ADMIN', routePath: '//example.com/help' })).toBe('https://admin.ngx-workshop.io/example.com/help');
  });
});
