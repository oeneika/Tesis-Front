import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { CamerasService } from "../../services/cameras.service";
import { WebSocketService } from "../../services/web-socket.service";

@Component({
  selector: "app-confidence-levels",
  templateUrl: "list-cameras.component.html",
  providers: [],
})
export class ListCamerasComponent implements OnInit, OnDestroy {
  modalRef: BsModalRef;
  public imIn: boolean = false;
  public cameras: any[];
  public subscriptions: Subscription[] = [];
  public liveCameras: any[];
  constructor(private modalService: BsModalService,
              private webSocketService: WebSocketService,
              private _cameraService: CamerasService) {}

  ngOnInit() {
    this.initSocket();
    this.getCamerasByUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    console.log("Data Camara :(", data);
    this.webSocketService.getRooms(data);
  }

  initSocket = () => {
    this.subscriptions.push(this.webSocketService.cbEvent.subscribe((res) => {
      console.log(res);
      if (res.name === "retrieve-rooms" && res.data.confirmedCamera) {
        console.log('Lo que me encontre: ', this.cameras.find(cam => cam.cameraId._id === res.data.cameraId));
        const alreadyAdded = this.liveCameras.findIndex(cam => cam.cameraId._id === res.data.cameraId) >= 0;
        if (!alreadyAdded) {
          this.liveCameras.push(this.cameras.find(cam => cam.cameraId.name && (cam.cameraId._id === res.data.cameraId)));
        }
      } else if (res.name === 'new-user') {
        this.getCamerasByUser();
      } else if (res.name === 'bye-user') {
        this.getCamerasByUser();
      } else if (res.name === 'message') {
        const leaving = res.data.message.findIndex(msj => msj.imDone) >= 0;
        if (leaving) {
          this.getCamerasByUser();
        }
      }
      console.log("Live Camaras :D", this.liveCameras);
    }));
  };

  /**
   * getCamerasByUser
   */
  public getCamerasByUser() {
    this._cameraService.getCamerasByUser().pipe(take(1)).subscribe((response: any) => {
      this.cameras = response;
      this.liveCameras = [];
      response.forEach(element => {
        this.getLiveCameras({cameraId: element?.cameraId?._id, joinRoom: !this.imIn});
      });
      this.imIn = true;
      console.log("Camaras :)", this.cameras);
    });
  }
}
