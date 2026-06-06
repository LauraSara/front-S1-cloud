import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MsalService } from '@azure/msal-angular';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const msalService = inject(MsalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        snackBar.open('Sesión expirada. Inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
        msalService.logoutRedirect();
      } else if (error.status === 403) {
        snackBar.open('No tiene permisos para realizar esta acción.', 'Cerrar', { duration: 5000 });
      } else if (error.status >= 500) {
        snackBar.open('Error del servidor. Intente nuevamente más tarde.', 'Cerrar', { duration: 5000 });
      } else if (error.status === 0) {
        snackBar.open('No se pudo conectar con el servidor.', 'Cerrar', { duration: 5000 });
      }
      return throwError(() => error);
    })
  );
};
