import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  MfeRemoteDomain,
  MfeRemoteDto,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { Domain } from '../models/menu.types';

@Injectable({ providedIn: 'root' })
export class MfeRoutesApiService {
  private readonly http = inject(HttpClient);

  list(domain: Domain) {
    const remoteDomain: MfeRemoteDomain =
      domain === 'ADMIN' ? 'admin' : 'workshop';
    return this.http.get<MfeRemoteDto[]>(
      `/api/mfe-remotes/domain/${remoteDomain}`
    );
  }
}
