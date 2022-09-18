import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-recover-password",
  templateUrl: "recover-password.component.html",
})
export class RecoverPasswordComponent implements OnInit {

  public pwd!: any;

  constructor(private router: Router, private activeRoute: ActivatedRoute,
    private userService: UserService) {
      localStorage.setItem("token", this.activeRoute.snapshot.paramMap.get("token"));
      this.pwd = {
        password: null,
        repeatPassword: null,
        token: this.userService.token
      }
  }

  ngOnInit() {
  }

  /**
   * recoverPassword
   */
  public recoverPassword() {
    this.userService.changePasswordByEmail(this.pwd).subscribe((response: any) => {
      setTimeout(() => {
        response?.ok ? this.router.navigate(['/login']) : undefined;
      }, 1500);
    });
  }
}
