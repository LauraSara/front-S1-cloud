import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const msalService = inject(MsalService);
  const broadcastService = inject(MsalBroadcastService);
  const router = inject(Router);

  return broadcastService.inProgress$.pipe(
    filter((status) => status === InteractionStatus.None),
    take(1),
    map(() => {
      const accounts = msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
