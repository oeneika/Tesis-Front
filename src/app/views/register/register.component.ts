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
    this.user = new User("", "", "", "", "", "", "", "", "ROLE_USER");
  }

  public onSubmit() {
    this._userService.signUp(this.user).subscribe(
      (data) => {
        console.log(data);
        let token = data["token"];
        if (token) {
          this.token = token;
          localStorage.setItem("token", JSON.stringify(token));
          this.router.navigate(["/"]);
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
