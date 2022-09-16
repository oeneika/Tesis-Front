import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor (private userService: UserService, private router: Router) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!this.auth) {
        !this.unverified ? this.router.navigate(['/verification-email']) : this.router.navigate(['/login']);
      }
    return this.shallPass;
  }

  private get shallPass(): boolean {
    return this.auth;
  }

  private get auth(): boolean {
    return !!this.userService.token && !!this.userService.identity && !!this.userService.secret;
  }

  private get unverified(): boolean {
    return !this.userService.token && !!this.userService.identity && !!this.userService.secret;
  }


}
