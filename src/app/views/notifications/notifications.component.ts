import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { take } from "rxjs/operators";

@Component({
  templateUrl: "notifications.component.html",
  providers: [UserService, ],
})
export class NotificationsComponent implements OnInit {
  public identity;
  public notifications: any[] = [];
  public recording: any;
  public page:number = 1;
  //public face: Face;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private _userService: UserService,
    private modalService: BsModalService, 
  ) {
    this.identity = this._userService.identity;
  }

  ngOnInit() {
    if (!this.identity) {
      this.router.navigate(["login"]);
    }
  }
}
