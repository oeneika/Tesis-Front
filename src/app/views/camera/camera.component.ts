import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { WebSocketService } from "../../services/web-socket.service";
import { PeerService } from "../../services/peer.service";

@Component({
  selector: "app-camera",
  templateUrl: "camera.component.html",
  providers: [],
})
export class CameraComponent implements OnInit {
  roomName: string;
  currentStream: any;
  listUser: Array<any> = [];
  statusCamera: Boolean = false;

  constructor(
    private route: ActivatedRoute,
    private webSocketService: WebSocketService,
    private peerService: PeerService
  ) {
    this.roomName = route.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    console.log("hola desde debug");
    this.checkMediaDevices();
    this.initPeer();
    this.initSocket();
  }

  //multiples cuartos donde cada uno envia un video

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
}
