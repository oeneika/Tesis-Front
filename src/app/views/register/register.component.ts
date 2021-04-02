import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-dashboard",
  templateUrl: "register.component.html",
  providers: [UserService],
})
export class RegisterComponent {
  public user: User;
  public errorRegister = false;
  public token;

  constructor(private _userService: UserService, private router: Router) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.clear();
  }

  public onSubmit() {
    this._userService.signUp(this.user).subscribe(
      (data) => {
        console.log(data);
        let token = data.token;
        if (token) {
          this.token = token;
          localStorage.setItem("token", JSON.stringify(token));
          let identity = data.id;
          //Crear elemento en el localstorage
          localStorage.setItem("identity", JSON.stringify(identity));
          let secret = data.secret.secret;
          let qr = data.secret.qr;
          this.router.navigate([`/your-code`]);
        } else {
          this.errorRegister = true;
        }
      },
      (err) => {
        var error = <any>err;
        if (error != null) {
          this.errorRegister = true;
        }
      }
    );
  }
}
