import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PacientesListComponent } from './features/pacientes/pacientes-list/pacientes-list.component';
import { PatientDetailComponent } from './features/pacientes/patient-detail/patient-detail.component';
import { AlertasListComponent } from './features/alertas/alertas-list/alertas-list.component';
import { MonitoreoComponent } from './features/vitals/monitoreo/monitoreo.component';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'auth', component: MsalRedirectComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [MsalGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pacientes', component: PacientesListComponent },
      { path: 'pacientes/:id', component: PatientDetailComponent },
      { path: 'monitoreo', component: MonitoreoComponent },
      { path: 'alertas', component: AlertasListComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
