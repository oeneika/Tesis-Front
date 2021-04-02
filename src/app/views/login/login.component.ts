import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  providers: [UserService],
})
export class LoginComponent implements OnInit {
  public user: User;
  public identity;
  public token;
  public errorLogin = false;

  constructor(private _userService: UserService, private router: Router) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.clear();
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  public onSubmit() {
    this._userService.signIn(this.user).subscribe(
      (data) => {
        let identity = data["id"];
        this.identity = identity;
        //Crear elemento en el localstorage
        localStorage.setItem("identity", JSON.stringify(identity));
        //Conseguir el token
        this._userService.signIn(this.user, "true").subscribe(
          (data) => {
            let token = data["token"];
            this.token = token;
            localStorage.setItem("token", JSON.stringify(token));
            let secret = data["secret"];
            this.router.navigate([`/verification-code/${secret}`]);
          },
          (err) => {
            var error = <any>err;
            if (error != null) {
              this.errorLogin = true;
            }
          }
        );
      },
      (err) => {
        var error = <any>err;
        if (error != null) {
          this.errorLogin = true;
        }
      }
    );
  }
}
