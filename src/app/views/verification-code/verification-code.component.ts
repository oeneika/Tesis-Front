import { Component, OnInit } from "@angular/core";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { ActivatedRoute, Router } from "@angular/router";

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

  constructor(
    private _userService: UserService,
    private router: Router,
    private _route: ActivatedRoute
  ) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    this.secret = this._route.snapshot.paramMap.get("secret");
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  public onSubmit() {
    let payload = this.user;
    this._userService.VerificationCode(payload, this.secret).subscribe(
      (data) => {
        console.log(data);
        this.router.navigate(["/"]);
      },
      (err) => {}
    );
  }
}
