import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class TwoStepsAuthenticationGuard implements CanActivateChild, CanActivate {

  constructor (private userService: UserService, private router: Router) {

  }
  canActivate(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      if (!this.twoSteps) {
        const route = this.userService.hasSetTwoSteps ? ['/verification-code/'.concat(this.userService.secret)] : ['/your-code'];
        this.router.navigate(route);
      } else if (!this.auth) {
        this.router.navigate(['/login']);
      }
    return this.shallPass;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
      if (!this.twoSteps) {
        const route = this.userService.hasSetTwoSteps ? ['/verification-code/'.concat(this.userService.secret)] : ['/your-code'];
        this.router.navigate(route);
      } else if (!this.auth) {
        this.router.navigate(['/login']);
      }
    return this.shallPass;
  }

  private get shallPass(): boolean {
    return !!this.auth && !!this.twoSteps;
  }
  
  private get twoSteps(): boolean {
    return (!!this.userService.hasSetTwoSteps && !this.userService.hasTwoStepsAuth) || (!!this.userService.hasSetTwoSteps && !!this.userService.hasTwoStepsAuth && !!this.userService.isTwoStepsAuth);
  }
  
  private get auth(): boolean {
    return !!this.userService.token && !!this.userService.identity;
  }
  
}
