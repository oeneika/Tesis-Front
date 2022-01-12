import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  providers: [UserService],
})
export class LoginComponent implements OnInit {
  public user: User;
  public identity;
  public token;

  constructor(private _userService: UserService, private router: Router, private toastr: ToastrService) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.removeItem("secret");
    localStorage.removeItem("hasTwoStepsAuth");
    localStorage.removeItem("hasSetTwoSteps");
    localStorage.removeItem("isTwoStepsAuth");
    localStorage.clear();
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
}
