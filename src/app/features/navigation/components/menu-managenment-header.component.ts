import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'menu-managenment-header' },
  selector: 'ngx-menu-managenment-header',
  imports: [MatIcon, NgxParticleHeader],
  template: `
    <ngx-particle-header>
      <div class="menu-managenment-header__hero-content">
        <div class="menu-managenment-header__eyebrow">
          <mat-icon>hub</mat-icon>
          Routing operations
        </div>
        <h1>Navigational List</h1>
        <p>Shape how users move through your platform.</p>
      </div>
    </ngx-particle-header>
  `,
  styles: [
    `
      :host,
      ngx-particle-header {
        display: block;
      }

      .menu-managenment-header__hero-content {
        width: min(100% - 3rem, 1440px);
        margin: 0 auto;
        padding: 2.5rem 0 2.25rem;
        color: var(--mat-sys-on-primary);
      }

      .menu-managenment-header__eyebrow {
        display: flex;
        align-items: center;
      }

      .menu-managenment-header__eyebrow {
        gap: 0.45rem;
        margin-bottom: 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.13em;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .menu-managenment-header__eyebrow mat-icon {
        width: 1rem;
        height: 1rem;
        font-size: 1rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(2rem, 4vw, 3.25rem);
        font-weight: 500;
        line-height: 1.05;
        letter-spacing: -0.04em;
      }

      .menu-managenment-header__hero-content p {
        margin: 0.75rem 0 0;
        font-size: 1rem;
        opacity: 0.78;
      }

      @media (max-width: 700px) {
        .menu-managenment-header__hero-content {
          width: min(100% - 2rem, 1440px);
          padding: 2rem 0;
        }
      }
    `,
  ],
})
export class MenuManagenmentHeader {}
