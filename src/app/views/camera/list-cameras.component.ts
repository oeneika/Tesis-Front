import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { CamerasService } from "../../services/cameras.service";

@Component({
  selector: "app-confidence-levels",
  templateUrl: "list-cameras.component.html",
  providers: [],
})
export class ListCamerasComponent implements OnInit {
  modalRef: BsModalRef;
  public cameras: any[];
  constructor(private modalService: BsModalService,
              private _cameraService: CamerasService) {}

  ngOnInit() {
    this.getCamerasByUser();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-dialog-centered",
    });
  }

  /**
   * getCamerasByUser
   */
  public getCamerasByUser() {
    this._cameraService.getCamerasByUser().subscribe((response: any) => {
      this.cameras = response;
    });
  }
}
