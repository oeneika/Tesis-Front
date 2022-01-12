import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { ClipboardService } from "ngx-clipboard";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-verification-code",
  templateUrl: "your-code.component.html",
  providers: [UserService],
})
export class YourCodeComponent implements OnInit {
  public user: User;
  public identity;
  public token;
  public usuario;
  public secret;
  public codeqr;

  constructor(
    private _userService: UserService,
    private router: Router,
    private _clipboardService: ClipboardService,
    private _route: ActivatedRoute
  ) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
  }

  ngOnInit() {
    this.identity = this._userService.identity;
    this.token = this._userService.token;
    if (this.identity) {
      this._userService.getUser(this.identity).subscribe(
        (data) => {
          this.usuario = data.user;
          this.user = this.usuario;
          this.secret = this.usuario.temp_secreto.secret;
          this.codeqr = this.usuario.temp_secreto.qr;
        },
        (err) => {}
      );
    }
  }

  copyContent() {
    this._clipboardService.copyFromContent(this.usuario.temp_secreto.secret);
  }

  /**
   * sethAuth
   */
  public sethAuth(twoSteps: boolean) {
    this._userService.setAuth({hasTwoStepsAuth: twoSteps, hasSetTwoSteps: true}).subscribe(
      (response: any) => {
        localStorage.setItem("hasTwoStepsAuth", JSON.stringify(twoSteps));
        localStorage.setItem("hasSetTwoSteps", JSON.stringify(true));
        this.router.navigate(['/']);
      }
    );
  }
}
