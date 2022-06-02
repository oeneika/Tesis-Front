import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { CamerasService } from "../../services/cameras.service";
import { PeerService } from "../../services/peer.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { WebSocketService } from "../../services/web-socket.service";

@Component({
  selector: "app-confidence-levels",
  templateUrl: "camera-details.component.html",
  providers: [],
})
export class CameraDetailsComponent implements OnInit {
  modalRef: BsModalRef;
  camera: any;
  stream: any;
  @ViewChild("video", { static: false }) video: ElementRef;
  constructor(private modalService: BsModalService,
              private webSocketService: WebSocketService,
              private spinner: NgxSpinnerService,
              private cameraService: CamerasService,
              private toastr: ToastrService,
              private peerService: PeerService,
              public _router: ActivatedRoute) {}

  ngOnInit() {
    this.cameraService.getCamerasByUser().subscribe((response: any[]) => {
      setTimeout(() => {
        this.spinner.show();
      }, 50);
      this.camera = response.find((camera: any) => camera?.cameraId?._id === this.cameraId);
    });
    this.initPeer();
    this.initSocket();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-dialog-centered",
    });
  }

  editCollaborator(x, user) {
    this.openModal(x);
  }

  initPeer = () => {
    const { peer } = this.peerService;
    let int = null;
    peer.on("open", (id) => {
      const body = {
        idPeer: id,
        roomName: this.cameraId,
      };
      int = setInterval(()=> {
        if (!this.stream) {
          this.webSocketService.leaveRoom(body);
          this.webSocketService.joinRoom(body);
        } else {
          clearInterval(int);
        }
      },5000);
      this.webSocketService.joinRoom(body);
    });

    peer.on(
      "call",
      (callEnter) => {
        console.log("agregando la llamada entrante al front", callEnter);
        callEnter.answer(null);
        this.spinner.hide();
        callEnter.on("stream", (streamRemote) => {
          // this.video.nativeElement.srcObject = streamRemote;
          this.stream = streamRemote;
        });
      },
      (err) => {
        console.log("*** ERROR *** Peer call ", err);
      }
    );
  };

  initSocket = () => {
    this.webSocketService.cbEvent.subscribe((res) => {
      if (res.name === "message") {
        res.data.message.forEach(item => {
          this.toastr.info(item.msg, 'Notificación', { disableTimeOut: true });
        });
      }
    });
  };

  /**
   * cameraId
   */
  public get cameraId(): string {
    return this._router?.snapshot?.params?.id;
  }
}
