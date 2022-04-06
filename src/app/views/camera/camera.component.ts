import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { WebSocketService } from "../../services/web-socket.service";
import { PeerService } from "../../services/peer.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Camera } from "../../models/camera";
import { CamerasService } from "../../services/cameras.service";
import { UserService } from "../../services/user.service";
import { ToastrService } from "ngx-toastr";


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
  modalRef: BsModalRef;
  recording = false;
  public identity;
  public idCamera;
  public cameras = [];

  @ViewChild('autoShownModal', { static: false }) autoShownModal?: ModalDirective;
  isModalShown = false;

  constructor(
    private route: ActivatedRoute,
    private webSocketService: WebSocketService,
    private peerService: PeerService,
    private modalService: BsModalService,
    private _cameraService: CamerasService,
    private _userService: UserService,
    private toastr: ToastrService

  ) {
    this.identity = this._userService.identity;
    this.roomName = route.snapshot.paramMap.get("id");
    this.camera = new Camera("", "", false, false, "");
    this.idCamera = this._cameraService.idCamera?.replace(/['"]+/g, '');
  }

  ngOnInit() {
    if(!this._cameraService.idCamera){
      this.showModal();
    }
    this.getCamera();
  }

  public getCamera() {
    console.log(this.idCamera)
    let id = this._cameraService.idCamera?.replace(/['"]+/g, '');
    if (id){
      this._cameraService.getCamera(id).subscribe(
        (data) => {
          this.camera = data;
          console.log(this.cameras);
        },
        (err) => {}
      );
    }

  }

  record(start: boolean) {

    if(this.camera.name == '' || this.camera.name == null){
      this.toastr.error('Debe añadirle un nombre a la cámara para iniciar la grabación.')
    }else{
      this.checkMediaDevices();
      this.initPeer();
      this.initSocket();
      this.recording = start;
    }
  }

  initPeer = () => {
    const { peer } = this.peerService;
    peer.on("open", (id) => {
      const body = {
        idPeer: id,
        roomName: this.roomName,
      };
      console.log("uniendose al cuarto");
      this.webSocketService.joinRoom(body);
    });

    peer.on(
      "call",
      (callEnter) => {
        console.log("agregando la llamada entrante al front");
        callEnter.answer(this.currentStream);
        callEnter.on("stream", (streamRemote) => {
          this.addVideoUser(streamRemote);
        });
      },
      (err) => {
        console.log("*** ERROR *** Peer call ", err);
      }
    );
  };

  initSocket = () => {
    this.webSocketService.cbEvent.subscribe((res) => {
      if (res.name === "new-user") {
        console.log("SOCKET", res);
        const { idPeer } = res.data;
        this.sendCall(idPeer, this.currentStream);
      }
    });
  };

  checkMediaDevices = () => {
    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: true,
        })
        .then((stream) => {
          this.currentStream = stream;
          this.addVideoUser(stream);
        })
        .catch(() => {
          console.log("*** ERROR *** Not permissions");
        });
    } else {
      console.log("*** ERROR *** Not media devices");
    }
  };

  addVideoUser = (stream: any) => {
    this.listUser.push(stream);
    const unique = new Set(this.listUser);
    this.listUser = [...unique];
  };

  sendCall = (idPeer, stream) => {
    console.log("enviando la llamada al peer", idPeer);
    const newUserCall = this.peerService.peer.call(idPeer, stream);
    if (!!newUserCall) {
      newUserCall.on("stream", (userStream) => {
        this.addVideoUser(userStream);
      });
    }
  };

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
