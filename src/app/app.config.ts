import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { MsalBroadcastService, MsalGuard, MsalModule, MsalService } from '@azure/msal-angular';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { msalProviders } from './core/auth/msal.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideCharts(withDefaultRegisterables()),
    importProvidersFrom(MsalModule),
    ...msalProviders,
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
