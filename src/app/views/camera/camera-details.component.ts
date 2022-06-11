import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CamerasService } from "../../services/cameras.service";
// import { PeerService } from "../../services/peer.service";
import { NgxSpinnerService } from 'ngx-spinner';
import { WebSocketService } from "../../services/web-socket.service";
import { take } from "rxjs/operators";
import { Subscription } from "rxjs";
import { environment } from "../../../environments/environment";
import Peer from "peerjs";
@Component({
  selector: "app-confidence-levels",
  templateUrl: "camera-details.component.html",
  providers: [],
})
export class CameraDetailsComponent implements OnInit, OnDestroy {
  public camera: any;
  public subscriptions: Subscription[] = [];
  public stream: any;
  public peer: any;
  // @ViewChild("video", { static: false }) video: ElementRef;
  constructor(private webSocketService: WebSocketService,
              private spinner: NgxSpinnerService,
              private cameraService: CamerasService,
              private toastr: ToastrService,
              // private peerService: PeerService,
              private _route: Router,
              public _router: ActivatedRoute) {}

  ngOnInit() {
    this.cameraService.getCamerasByUser().pipe(take(1)).subscribe((response: any[]) => {
      setTimeout(() => {
        this.spinner.show();
      }, 50);
      this.camera = response.find((camera: any) => camera?.cameraId?._id === this.cameraId);
      this.initPeer();
      this.initSocket();
    });
  }

  initPeer = () => {
    this.peer = new Peer('tesis-' + String(JSON.parse(localStorage.getItem('idCamera'))), {
      host: environment.peerjsHost,
      port: environment.peerJSPort,
      path: '/peerjs',
      secure: false
    });
    let int = null;
    this.peer.on("open", (id) => {
      let tries = 0;
      const body = {
        idPeer: id,
        roomName: this.cameraId,
      };
      int = setInterval(()=> {
        if (!this.stream) {
          tries++;
          this.webSocketService.leaveRoom(body);
          if (tries >= 3) {
            this.backToList();
            clearInterval(int);
          } else {
            this.webSocketService.joinRoom(body);
          }
        } else {
          clearInterval(int);
        }
      },5000);
      this.webSocketService.joinRoom(body);
    });

    this.peer.on(
      "call",
      (callEnter) => {
        this.spinner.hide();
        console.log("agregando la llamada entrante al front", callEnter);
        callEnter.answer(null);
        callEnter.on("stream", (streamRemote) => {
          // this.video.nativeElement.srcObject = streamRemote;
          this.stream = streamRemote;
        });
      }
    );
  };

  initSocket = () => {
    this.subscriptions.push(this.webSocketService.cbEvent.subscribe((res) => {
      console.log(res);
      if (res.name === "message") {
        res.data.message.forEach(item => {
          if (item.msg) {
            this.toastr.info(item.msg, 'Notificación', { disableTimeOut: true });
          }
          if(item.imDone) {
            this.backToList();
            this.peer.destroy();
            this.subscriptions.forEach(subscription => subscription.unsubscribe());
          }
        });
      } else if (res.name === 'bye-user') {
        this.backToList();
        this.peer.destroy();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
      }
    }));
  };

  /**
   * backToList
   */
  public backToList() {
    this.spinner.show();
    this.toastr.warning('Cámara desconectada', 'Se ha desconectado la cámara de la red, por favor revise el dispositivo, se redireccionará en breve al listado de cámaras activas.');
    setTimeout(() => {
      this.spinner.hide();
      this._route.navigate(['camera/list-cameras']);
    }, 3000);
  }

  ngOnDestroy(): void {
    // this.video.nativeElement.pause();
    // this.video.nativeElement.src = '';
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // this.webSocketService.leaveRoom({
    //   idPeer: 'Du hast',
    //   roomName: this.cameraId,
    // });
    this.peer.destroy();
    // this.peerService.peer.destroy();
    // this.webSocketService.disconnect();
  }

  /**
   * cameraId
   */
  public get cameraId(): string {
    return this._router?.snapshot?.params?.id;
  }
}
