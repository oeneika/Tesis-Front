import { Component, OnInit } from "@angular/core";
("@angular/core");
import { navItems } from "../../_nav";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { SwPush } from "@angular/service-worker";

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
  respuesta: any;
  readonly VAPID_PUBLIC_KEY =
    "BPWkPcyZruyIUOSj6XWbltqNRDP5sfC2hO31tRQPGs9AgAkxPcxRqbMnAQiuPbdSZDqcgWggIBJ0IOWzvf0i4hw";
  public secret;

  constructor(
    private swPush: SwPush,
    private _userService: UserService,
    private router: Router
  ) {
    this.user = new User("", "", "", "", "", {}, "", "", "", "ROLE_USER");
    this.identity = this._userService.identity;
    this.token = this._userService.token;
  }

  ngOnInit() {
    //Si el usuario no inicio sesión no puede ver el contenido
    if (!this.identity) {
      this.router.navigate(["login"]);
    }

    this._userService.getUser(this.identity).subscribe(
      (data) => {
        this.usuario = data.user;
        this.user = this.usuario;
        this.setPhoto();
        this.secret = this.user.temp_secreto;
      },
      (err) => {}
    );
  }

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((respuesta) => {
        this.respuesta = respuesta;
      })
      .catch((err) => {
        this.respuesta = err;
      });
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
    localStorage.removeItem("secret");
    localStorage.clear();
    this.router.navigate(["/login"]);
  }
}
