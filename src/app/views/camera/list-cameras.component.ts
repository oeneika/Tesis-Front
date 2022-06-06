import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { CamerasService } from "../../services/cameras.service";
import { WebSocketService } from "../../services/web-socket.service";

@Component({
  selector: "app-confidence-levels",
  templateUrl: "list-cameras.component.html",
  providers: [],
})
export class ListCamerasComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  public cameras: any[];
  public liveCameras: any[];
  constructor(private modalService: BsModalService,
              private webSocketService: WebSocketService,
              private _cameraService: CamerasService) {}

  ngOnInit() {
    this.initSocket();
    this.getCamerasByUser();
  }

  ngOnDestroy(): void {
    // this.webSocketService.disconnect();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-dialog-centered",
    });
  }

  /**
   * getLiveCameras
   */
  public getLiveCameras(data: any) {
    this.webSocketService.getRooms(data);
  }

  initSocket = () => {
    this.webSocketService.cbEvent.subscribe((res) => {
      console.log(res);
      if (res.name === "retrieve-rooms" && res.data.confirmedCamera) {
        this.liveCameras.push(this.cameras.find(cam => cam.cameraId._id === res.data.cameraId));
        this.webSocketService.leaveRoom({
          idPeer: 'wtf',
          roomName: res.data.cameraId,
        });
      } else if (res.name === 'new-user') {
        this.getCamerasByUser();
      } else if (res.name === 'bye-user') {
        // this.liveCameras = [];
        this.getCamerasByUser();
      }
    });
  };

  /**
   * getCamerasByUser
   */
  public getCamerasByUser() {
    this._cameraService.getCamerasByUser().subscribe((response: any) => {
      this.cameras = response;
      this.liveCameras = [];
      response.forEach(element => {
        this.getLiveCameras({cameraId: element?.cameraId?._id, joinRoom: true});
      });
    });
  }
}
