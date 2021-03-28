import { Component, OnInit } from "@angular/core";
("@angular/core");
import { navItems } from "../../_nav";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
  providers: [UserService],
})
export class DefaultLayoutComponent implements OnInit {
  public sidebarMinimized = false;
  public navItems = navItems;
  public user: User;
  public identity;
  public usuario;
  public token;
  public errorLogin = false;
  public photo_default = "../../../assets/img/avatars/default.png";

  constructor(private _userService: UserService, private router: Router) {
    this.user = new User("", "", "", "", "", "", "", "", "ROLE_USER");
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit() {
    this._userService.getUser(this.identity).subscribe(
      (data) => {
        this.usuario = data.user;
        this.user = this.usuario;
        this.setPhoto();
      },
      (err) => {}
    );
  }

  public setPhoto() {
    if (this.user.image && this.user.image != null) {
      this.photo_default =
        "http://localhost:8000/api/get-image-file/" + this.user.image;
    }
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  logout() {
    localStorage.removeItem("identity");
    localStorage.removeItem("token");
    localStorage.clear();
    this.router.navigate(["/login"]);
  }
}
