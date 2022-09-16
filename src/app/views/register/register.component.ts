import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-dashboard",
  templateUrl: "register.component.html",
  providers: [UserService],
})
export class RegisterComponent {
  public user: User;
  public errorRegister = false;

  constructor(private _userService: UserService, private router: Router, private toastr: ToastrService) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.removeItem("secret");
    localStorage.removeItem("hasTwoStepsAuth");
    localStorage.removeItem("hasSetTwoSteps");
    localStorage.removeItem("isTwoStepsAuth");
    // localStorage.clear();
  }

  public onSubmit() {
    if (this.user.email && this.user.name && this.user.surname && this.user.password) {
      this._userService.signUp(this.user).subscribe(
        (data) => {
          console.log(data);
          if (data.token) {
            localStorage.setItem("secret", JSON.stringify(data.secret.secret));
            // localStorage.setItem("token", JSON.stringify(data.token));
            localStorage.setItem("identity", JSON.stringify(data.id));
            localStorage.setItem("hasTwoStepsAuth", JSON.stringify(data.hasTwoStepsAuth));
            localStorage.setItem("hasSetTwoSteps", JSON.stringify(data.hasSetTwoSteps));
            localStorage.setItem("email", JSON.stringify(this.user.email));
            this.router.navigate(['/verification-email']);
          } else {
            this.errorRegister = true;
          }
        }
      );
    } else if (!this.user.email && this.user.name && this.user.surname && this.user.password) {
      this.toastr.error('El correo es un campo obligatorio.');
    } else if (this.user.email && this.user.name && this.user.surname && !this.user.password) {
      this.toastr.error('La contraseña es un campo obligatorio.');
    } else if (this.user.email && !this.user.name && this.user.surname && this.user.password) {
      this.toastr.error('El nombre es un campo obligatorio.');
    } else if (this.user.email && this.user.name && !this.user.surname && this.user.password) {
      this.toastr.error('El apellido es un campo obligatorio.');
    } else {
      this.toastr.error('Todos los campos son obligatorios.');
    }
  }
}
