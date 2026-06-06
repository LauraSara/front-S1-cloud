import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MsalService } from '@azure/msal-angular';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly msalService = inject(MsalService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Pacientes', route: '/pacientes', icon: 'personal_injury' },
    { label: 'Monitoreo', route: '/monitoreo', icon: 'monitor_heart' },
    { label: 'Alertas', route: '/alertas', icon: 'notification_important' }
  ];

  get userName(): string {
    const account = this.msalService.instance.getActiveAccount();
    return account?.name || account?.username || 'Usuario';
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }
}
