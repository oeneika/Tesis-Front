import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Camera } from "../../models/camera";
import { CamerasService } from "../../services/cameras.service";
import { UserService } from "../../services/user.service";
import { ToastrService } from "ngx-toastr";
import { ConfidenceLevels } from "../../models/confidenceLevels";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { take } from "rxjs/operators";


@Component({
  selector: "app-camera",
  templateUrl: "camera.component.html",
  providers: [CamerasService],
})
export class CameraComponent implements OnInit {
  public camera: Camera;
  roomName: string;
  currentStream: any;
  listUser: Array<any> = [];
  statusCamera: Boolean = true;
  public confidenceLevels: any[];
  modalRef: BsModalRef;
  recording = false;
  public identity;
  public idCamera;
  public cameras = [];

  @ViewChild('autoShownModal', { static: false }) autoShownModal?: ModalDirective;
  isModalShown = false;

  constructor(
    private route: ActivatedRoute,
    // private webSocketService: WebSocketService,
    // private peerService: PeerService,
    private modalService: BsModalService,
    private _cameraService: CamerasService,
    private _confidenceLevelsService: ConfidenceLevelsService,
    private _userService: UserService,
    private toastr: ToastrService

  ) {
    this.identity = this._userService.identity;
    this.roomName = route.snapshot.paramMap.get("id");
    this.camera = new Camera("", "", false, false, "");
    this.idCamera = this._cameraService.idCamera?.replace(/['"]+/g, '');
  }

  ngOnInit() {
    this.getCamerasByUser();
    this.getConfidenceLevels();
  }

  /**
   * getCamerasByUser
   */
   public getCamerasByUser() {
    this._cameraService.getCamerasByUser().pipe(take(1)).subscribe((response: any) => {
      console.log('Camaras: ', response);
      this.cameras = response.map((res: any) => res.cameraId);
      if((this.cameras.length === 0) && !this._cameraService.idCamera) {
        this.showModal();
      }
      this.getCamera();
    });
  }

  /**
   * getConfidenceLevels
   */
  public getConfidenceLevels() {
    this._confidenceLevelsService.getConfidenceLevels().subscribe((response: any) => {
      this.confidenceLevels = response;
    });
  }

  public getCamera() {
    console.log(this.idCamera)
    if (this.idCamera){
      this._cameraService.getCamera(this.idCamera).subscribe(
        (data) => {
          this.camera = data;
          console.log('Camara: ', data);
          // this.record(true);
        },
        (err) => {}
      );
    }

  }

  /**
   * onCameraChange
   */
  public onCameraChange(value: any) {
    this.idCamera = value;
    localStorage.setItem("idCamera", JSON.stringify(value));
    this.getCamera();
  }

  record(start: boolean) {

    if(this.camera.name == '' || this.camera.name == null){
      this.toastr.error('Debe añadirle un nombre a la cámara para iniciar la grabación.')
    }else{
      this.recording = start;
    }
  }

  changeStatus() {
    if (!this.statusCamera) {
      this.statusCamera = true;
    } else {
      this.statusCamera = false;
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

  showModal(): void {
    this.idCamera = null;
    localStorage.removeItem("idCamera");
    this.camera = new Camera("", "", false, false, "");
    this.isModalShown = true;
  }

  hideModal(): void {
    this.autoShownModal?.hide();
  }

  onHidden(): void {
    this.isModalShown = false;
  }


  public onSubmit() {
    let payload = this.camera;
    payload.administratorId = this.identity;
    this._cameraService.addCamera(payload).subscribe(
      (data) => {
        this.camera = data;
        this.camera = new Camera(data._id,data.name, data.power, data.turn_screen, this.identity);
        this.idCamera = data._id;
        localStorage.setItem("idCamera", JSON.stringify(data._id));
        this.hideModal();
        this.toastr.success('Cámara creada exitosamente');
        this.getCamera();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
