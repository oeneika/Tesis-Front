import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
interface VerificationCodeForm {
  token_secret: string;
}

@Component({
  selector: "app-verification-code",
  templateUrl: "verification-code.component.html",
  providers: [UserService],
})
export class VerficationCodeComponent implements OnInit {
  public user: User;
  public identity;
  public token;
  public secret;
  public errorMessage: Boolean = false;
  formulario: VerificationCodeForm = {
    token_secret: "",
  };

  constructor(
    private _userService: UserService,
    private router: Router,
    private _route: ActivatedRoute
  ) {
    this.secret = this._route.snapshot.paramMap.get("secret");
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  public onSubmit() {
    let payload = this.formulario.token_secret;
    this._userService.VerificationCode(payload, this.secret).subscribe(
      (data) => {
        console.log(data);
        this.router.navigate(["/"]);
      },
      (err) => {
        this.errorMessage = true;
      }
    );
  }
}
