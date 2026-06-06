import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const msalService = inject(MsalService);
  const account =
    msalService.instance.getActiveAccount() ?? msalService.instance.getAllAccounts()[0];

  if (!account) {
    return next(req);
  }

  return from(
    msalService.instance.acquireTokenSilent({
      account,
      scopes: environment.azure.scopes,
    })
  ).pipe(
    switchMap((result) => {
      const token = result.idToken || result.accessToken;
      const authReq = token
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        : req;

      return next(authReq);
    })
  );
};
