import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(error => {
      console.error('API Error:', error);
      
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => new Error('Session expirée. Veuillez vous reconnecter.'));
      }
      
      return throwError(() => error);
    })
  );
};
