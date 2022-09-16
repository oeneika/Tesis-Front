import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "forgot-password.component.html",
})
export class ForgotPasswordComponent implements OnInit {

  public user!: any;
  public sent = false;
  constructor(private router: Router,
    private userService: UserService) {
      this.user = { email: null };
  }

  ngOnInit() {
  }

  /**
   * submit
   */
  public submit() {
    console.log(this.user);

    this.userService.forgotPassword(this.user?.email).subscribe((response: any) => {
      this.sent = true;
    });
  }
}
