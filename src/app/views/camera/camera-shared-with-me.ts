import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "app-cameras-shared-with-me",
  templateUrl: "camera-shared-with-me.html",
  providers: [],
})
export class CameraSharedWithMeComponent implements OnInit {
  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  ngOnInit() {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-dialog-centered",
    });
  }

  editCollaborator(x, user) {
    this.openModal(x);
  }
}
