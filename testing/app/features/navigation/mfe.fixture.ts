import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
export const mfeRemote = (
  name = 'Dashboard',
  overrides: Partial<MfeRemoteDto> = {}
): MfeRemoteDto => ({
  _id: name,
  name,
  type: 'user-journey',
  remoteEntryUrl: 'https://example.com/remoteEntry.js',
  version: 1,
  description: '',
  lastUpdated: '',
  archived: false,
  useRoutes: true,
  requiresAuth: false,
  isAdmin: false,
  __v: 0,
  ...overrides,
});
