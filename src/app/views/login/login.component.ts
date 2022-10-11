import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { SwPush } from '@angular/service-worker';
import { NotificationService } from "../../services/notifications.service";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  providers: [UserService],
})
export class LoginComponent implements OnInit {
  public user: User;
  public identity;
  public token;
  respuesta: any;
  readonly VAPID_PUBLIC_KEY = "BNDAl3-ES2V08t5bTL-3YuexUNceQr8c4Cel79zqP3A4GUxsDscRc2JEAWmYmAvJwtOxsYqMl4pR9dD1hZ1ofqg";

  constructor(private _userService: UserService, private swPush: SwPush, private router: Router, private toastr: ToastrService, private notificationService: NotificationService) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.removeItem("secret");
    localStorage.removeItem("hasTwoStepsAuth");
    localStorage.removeItem("hasSetTwoSteps");
    localStorage.removeItem("isTwoStepsAuth");
    localStorage.clear();
    this.subscribeToNotifications();
  }

  ngOnInit() {
    this.identity = this._userService.identity;
    this.token = this._userService.token;
  }

  public onSubmit() {
    if (this.user.email && this.user.password) {
          this._userService.signIn(this.user, "true").subscribe(
            (data: any) => {
              localStorage.setItem("identity", JSON.stringify(data.id));
              localStorage.setItem("token", JSON.stringify(data.token));
              localStorage.setItem("secret", JSON.stringify(data.secret));
              localStorage.setItem("hasTwoStepsAuth", JSON.stringify(data.hasTwoStepsAuth));
              localStorage.setItem("hasSetTwoSteps", JSON.stringify(data.hasSetTwoSteps));
              this.router.navigate(['/']);
            }
          );
    } else if (!this.user.email && this.user.password) {
      this.toastr.error('El correo es un campo obligatorio.');
    } else if (this.user.email && !this.user.password) {
      this.toastr.error('La contraseña es un campo obligatorio.');
    } else {
      this.toastr.error('Todos los campos son obligatorios.');
    }
  }
/*NOTIFICACIONES PUSH*/
  subscribeToNotifications = () => {
    if (!this.swPush.isEnabled) {
      console.log("Notification is not enabled.");
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then((val) => {
      console.log('Push: ', val);
      this.notificationService.sendNotificationsPush({
        endpoint: val?.endpoint,
        auth: val.getKey('auth'),
        p256dh: val.getKey('p256dh')
      })
    }).catch((val) => console.log);
  };
}
