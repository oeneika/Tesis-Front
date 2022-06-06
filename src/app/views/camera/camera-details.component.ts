import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
export class CameraDetailsComponent implements OnInit, OnDestroy {
  camera: any;
  stream: any;
  // @ViewChild("video", { static: false }) video: ElementRef;
  constructor(private webSocketService: WebSocketService,
              private spinner: NgxSpinnerService,
              private cameraService: CamerasService,
              private toastr: ToastrService,
              private peerService: PeerService,
              private _route: Router,
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
      }
    );
  };

  initSocket = () => {
    this.webSocketService.cbEvent.subscribe((res) => {
      console.log(res);
      if (res.name === "message") {
        res.data.message.forEach(item => {
          this.toastr.info(item.msg, 'Notificación', { disableTimeOut: true });
        });
      } else if (res.name === 'bye-user') {
        this.spinner.show();
        this.toastr.warning('Cámara desconectada', 'Se ha desconectado la cámara de la red, por favor revise el dispositivo, se redireccionará en breve al listado de cámaras activas.');
        setTimeout(() => {
          this.spinner.hide();
          this._route.navigate(['camera/list-cameras']);
        }, 3000);
      }
    });
  };

  ngOnDestroy(): void {
    // this.video.nativeElement.pause();
    // this.video.nativeElement.src = '';
    this.webSocketService.leaveRoom({
      idPeer: 'Du hast',
      roomName: this.cameraId,
    });
    this.peerService.peer.destroy();
    this.webSocketService.disconnect();
  }

  /**
   * cameraId
   */
  public get cameraId(): string {
    return this._router?.snapshot?.params?.id;
  }
}
