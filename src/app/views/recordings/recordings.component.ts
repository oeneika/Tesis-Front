import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { RecordingsService } from "../../services/recordings.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
  templateUrl: "recordings.component.html",
  providers: [UserService, RecordingsService],
})
export class RecordingsComponent implements OnInit {
  public identity;
  //public face: Face;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private _userService: UserService,
    private modalService: BsModalService, 
    private _recordingsService : RecordingsService
  ) {
    this.identity = this._userService.identity;
  }

  ngOnInit() {
    if (!this.identity) {
      this.router.navigate(["login"]);
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg modal-dialog-centered",
    });
  }

  openRecordings(x, recordings) {
    this.openModal(x);
    //this.face = user;
  }
}
