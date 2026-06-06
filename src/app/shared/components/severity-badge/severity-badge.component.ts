import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Severity } from '../../../models/vital-sign.model';

@Component({
  selector: 'app-severity-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="severityClass">{{ label }}</span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .severity-normal {
      background-color: rgba(25, 135, 84, 0.12);
      color: #198754;
      border: 1px solid rgba(25, 135, 84, 0.3);
    }
    .severity-advertencia {
      background-color: rgba(255, 193, 7, 0.15);
      color: #b8860b;
      border: 1px solid rgba(255, 193, 7, 0.4);
    }
    .severity-critico {
      background-color: rgba(220, 53, 69, 0.12);
      color: #dc3545;
      border: 1px solid rgba(220, 53, 69, 0.3);
    }
  `]
})
export class SeverityBadgeComponent {
  @Input({ required: true }) severity!: Severity;

  get severityClass(): string {
    const map: Record<Severity, string> = {
      NORMAL: 'severity-normal',
      ADVERTENCIA: 'severity-advertencia',
      CRITICO: 'severity-critico'
    };
    return map[this.severity];
  }

  get label(): string {
    const map: Record<Severity, string> = {
      NORMAL: 'Normal',
      ADVERTENCIA: 'Advertencia',
      CRITICO: 'Crítico'
    };
    return map[this.severity];
  }
}
