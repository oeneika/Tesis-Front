import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceDetection } from 'face-api.js';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Peer from 'peerjs';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FaceService } from '../../../services/face.service';
import { ImageService } from '../../../services/images.service';
import { NotificationService } from '../../../services/notifications.service';
import { PeerService } from '../../../services/peer.service';
import { RecordingsService } from '../../../services/recordings.service';
import { UserService } from '../../../services/user.service';
import { WebSocketService } from '../../../services/web-socket.service';
declare var MediaRecorder: any;

@Component({
  selector: 'app-app-video-player',
  templateUrl: './app-video-player.component.html',
  styleUrls: ['./app-video-player.component.scss']
})
export class AppVideoPlayerComponent implements OnInit, OnDestroy {

  public faces: any[] = [];
  public expressions: any = { 'angry': 'Molesto', 'disgusted': 'Asqueado', 'fearful': 'Atemorizado', 'happy': 'Feliz', 'neutral': 'Neutral', 'sad': 'Triste', 'surprised': 'Sorprendido' };
  public identity;
  public last: boolean= false;
  public interval = null;
  public loading = true;
  public lastRecognition: any;
  public peer: Peer;
  public subscriptions: Subscription[] = [];
  public notifiedKnownFaces: string[] = [];
  @ViewChild("video", { static: false }) video: ElementRef;
  @ViewChild("canvas", { static: false }) canvasRef: ElementRef;
  @ViewChild("capture", { static: false }) captureRef: ElementRef;
  @ViewChild("prueba", { static: false }) prueba: ElementRef;
  @Input() cameraId: any;
  @Input() confidenceLevels: any;
  public localRecorder: any;
  public localStream: any;
  @Output() closeCamera: EventEmitter<any> = new EventEmitter<any>();
  public recognitions: any[] = [];
  constructor(
    private elRef: ElementRef,
    private _faceService: FaceService,
    private _userService: UserService,
    private webSocketService: WebSocketService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private _videoService: RecordingsService,
    private _imageService: ImageService) {
  }
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;
  captureCheck: boolean = true;

  image1;
  image2;

  async ngOnInit() {
    this.identity = this._userService.identity;
    this.loadFaces();
    navigator.mediaDevices.enumerateDevices();
    await Promise.all([
      await faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/models"),
      await faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/models"),
      await faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.faceExpressionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.ageGenderNet.loadFromUri("../../assets/models"),
    ]).then(() => this.startVideo());
  }

  /**
   * loadFaces
   */
  public loadFaces() {
    this._faceService.getFaceByUser(this.identity).pipe(take(1)).subscribe((response: any) => {
      this.faces = response;
      setTimeout(() => {
        this.spinner.show();
      }, 50);
    });
  }
    initPeer = () => {
      this.peer = new Peer('tesis-player-' + this.cameraId, {
      host: environment.peerjsHost,
      port: environment.peerJSPort,
      path: '/peerjs',
      secure: false
    });
    this.peer.on("open", (id) => {
      const body = {
        idPeer: id,
        roomName: this.cameraId,
      };
      this.webSocketService.joinRoom(body);
      this.initSocket();
    });
  };

  initSocket = () => {
    this.subscriptions.push(this.webSocketService.cbEvent.subscribe((res) => {
      console.log(res);
      if (res.name === "new-user") {
        const { idPeer } = res.data;
        setTimeout(() => {
          this.sendCall(idPeer, this.localStream);
        }, 500);
      } else if (res.name === "retrieve-rooms") {
        this.webSocketService.getRooms({cameraId: this.cameraId, confirmedCamera: true})
      }
    }));
  };

  sendCall = (idPeer, stream) => {
    console.log("enviando la llamada al peer", idPeer);
    this.peer.call(idPeer, stream);
  };

  startVideo() {
    this.videoInput = this.video.nativeElement;
    const p = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    p.then((mediaStream: MediaStream) => {
      this.localStream = mediaStream;
      this.video.nativeElement.srcObject = mediaStream;
      this.onVideoPlay();
      this.initPeer();
      this.recordVideo(mediaStream);
      setTimeout(() => {
        this.stopVideo();
      }, 30000);
    });
    p.catch(function(err) { console.log(err.name); }); // always check for errors at the end.
  }

  async onVideoPlay() {
    this.elRef.nativeElement
      .querySelector("video")
      .addEventListener("play", async () => {
        this.loading = false;
        this.spinner.hide();
        this.lastRecognition = this.videoInput;
        this.canvas = await faceapi.createCanvasFromMedia(this.videoInput);
        this.canvasEl = this.canvasRef.nativeElement;
        this.canvasEl.appendChild(this.canvas);
        this.canvas.setAttribute("id", "canvass");
        this.displaySize = {
          width: this.videoInput.offsetWidth,
          height: this.videoInput.offsetHeight,
        };
        faceapi.matchDimensions(this.canvas, this.displaySize);
        await this.detectFaces();
      });
  }

  private async detectFaces() {
    this.detection = await faceapi
      .detectAllFaces(
        this.videoInput,
        new faceapi.SsdMobilenetv1Options()
      ).withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    this.resizedDetections  = faceapi.resizeResults(
      this.detection,
      this.displaySize
    );
    this.canvas
      .getContext("2d")
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
    faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
    faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
    if (this.resizedDetections.length > 0 && this.captureCheck) {
      // En el campo resizedDetection esta toda la info de edad genero y toda la mierda, tambien donde esta la cara de la gente para ver si recortas.
      this.capture(this.detection);
      this.captureCheck = false;
    } else {
      this.detectFaces();
    }
  }

  private async capture(detection: any[]) {
      this.compareFaces(this.videoInput, detection);
      setTimeout(() => {
        this.captureCheck = true;
      }, 15000);
  }

  private async compareFaces(capturedFace: any, detection: any[]) {
    const _recognitions = [];
    for (const detect of detection) {
      let recognition = { user: null, msg: null, distance: 1, face: null };
      for (const face of this.faces) {
        if (face?.image) {
          const distance = await this.imgComparison(environment.url + 'get-image-face/'.concat(face.image), capturedFace ? capturedFace : this.videoInput);
          if (distance <= 0.6 && distance < recognition.distance) {
            recognition.distance = distance;
            recognition.msg = 'Se reconoció a '.concat(face?.name, ' ', face?.surname);
            recognition.user = face?._id;
            recognition.face = face
            console.log(distance, recognition);
          }
        }
      }
      if (recognition.user && (_recognitions.findIndex(user => user?.user === recognition?.user) === -1)) {
        _recognitions.push(recognition);
        if (this.notifiedKnownFaces.findIndex(face => face === recognition.user) === -1) {
          this.notifiedKnownFaces.push(recognition.user);
          console.log('Notified Faces Added ', this.notifiedKnownFaces);
          this.sendNotification(detect, recognition);
          this.webSocketService.notifyRoom({
            idPeer: this.peer.id,
            roomName: this.cameraId,
            message: _recognitions
          });
          setTimeout(() => {
            const index = this.notifiedKnownFaces.findIndex(face => face === recognition.user);
            console.log('User ID ', recognition.user);
            this.notifiedKnownFaces.splice(index, 1);
            console.log('Notified Faces Sliced ', this.notifiedKnownFaces);
          }, 60000);
          // }, 900000);
        } else {
          this.detectFaces();
        }
      } else if (!recognition.user) {
        _recognitions.push({ msg: 'Alerta! Rostro desconocido' });
        this.sendNotification(this.detection[0], null, true);
        this.webSocketService.notifyRoom({
          idPeer: this.peer.id,
          roomName: this.cameraId,
          message: _recognitions
        });
      }
    }

    this.recognitions = [].concat(_recognitions);
  }

  private sendNotification(detection: any, recognition: any, unknown?: boolean | false) {
    this.spinner.show();
    const faceExpression = { points: 0, exp: null };
    for (const expression in detection?.expressions) {
      if (Object.prototype.hasOwnProperty.call(detection?.expressions, expression)) {
        detection?.expressions[expression] > faceExpression.points ? (faceExpression.points = detection?.expressions[expression]) && (faceExpression.exp = expression) : undefined;
      }
    }
      const canvas: HTMLCanvasElement = this.captureRef.nativeElement;
      canvas.setAttribute('width', this.videoInput.offsetWidth);
      canvas.setAttribute('height', this.videoInput.offsetHeight);
      canvas.getContext('2d').drawImage(this.videoInput, 0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
      canvas.toBlob(
        _blob => {
          const name = recognition?.user ? recognition?.user : 'unknownuser';
          const imgFD = new FormData();
          imgFD.append('name', name.concat(moment().format('DD-MM-yyyy-HH-mm-ss'),'.png'));
          imgFD.append('dateNow', moment().format('DD-MM-yyyy HH:mm:ss'));
          imgFD.append('camera', this.cameraId);
          imgFD.append('imagen', new File([_blob], name.concat(moment().format('DD-MM-yyyy-HH-mm-ss'),'.png')), name.concat(moment().format('DD-MM-yyyy-HH-mm-ss'),'.png'));
          recognition?.user ? this._imageService.createImage(imgFD).pipe(take(1)).subscribe((response: any) => {
            const faceImgFD = new FormData();
            faceImgFD.append('facialExpression', this.expressions[faceExpression.exp]);
            faceImgFD.append('user', this.identity);
            faceImgFD.append('image', response?.image?._id);
            faceImgFD.append('face', recognition?.user);
            this._faceService.createFaceImage(faceImgFD).pipe(take(1)).subscribe(res => {this.detectFaces(); this.toastr.success('Rostro detectado y notificación enviada'); this.spinner.hide();});
          }) :
          forkJoin([this._imageService.createImage(imgFD), this._faceService.addFace({
            name: recognition?.face?.name ? recognition?.face?.name : 'Desconocido',
            surname: recognition?.face?.surname ? recognition?.face?.surname : 'Desconocido',
            user: this.identity,
            gender: detection.gender === 'male' ? 'Masculino' : detection.gender === 'female'? 'Femenino' : detection.gender,
            age: Math.round(detection.age),
            confidenceLevels: recognition?.face?.confidenceLevels ? recognition?.face?.confidenceLevels : this.confidenceLevels[2]._id,
            unknown: unknown
          })]).pipe(take(1)).subscribe((response: any) => {
            const faceImgFD = new FormData();
            faceImgFD.append('facialExpression', this.expressions[faceExpression.exp]);
            faceImgFD.append('user', this.identity);
            faceImgFD.append('image', response[0]?.image?._id);
            faceImgFD.append('face', response[1]?.face?._id);
            this._faceService.createFaceImage(faceImgFD).pipe(take(1)).subscribe(res => {this.detectFaces(); this.toastr.success('Rostro detectado y notificación enviada'); this.spinner.hide();});
          });
        },
        "image/png",
        0.01 /* quality */
    );
  }

  private async imgComparison (img1, img2): Promise<number> {
    try {
      let img;
      await faceapi.fetchImage(img1).then(res => img = res);
      const reference = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptor();

      if (!reference) {
        return 1;
      }

      const faceMatcher = new faceapi.FaceMatcher(reference)
      const results = await faceapi.detectAllFaces(img2, new faceapi.SsdMobilenetv1Options()).withFaceLandmarks().withFaceDescriptors();
      let match = 1;
      results.forEach(fd => {
        const bestMatch = faceMatcher.findBestMatch(fd.descriptor)
        match =  match > bestMatch?.distance ? bestMatch?.distance : match;
      });
      return match;
    } catch (error) {
      return 1;
    }
  }

  ngOnDestroy(): void {
    this.video.nativeElement.pause();
    this.video.nativeElement.src = '';
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.localRecorder.stop();
    this.last = true;
    this.webSocketService.notifyRoom({
      idPeer: this.peer.id,
      roomName: this.cameraId,
      message: [{imDone: true}]
    });
    this.peer.destroy();
    this.localStream.getTracks()
    .forEach((track) => {
        track.stop();
    });
    this.closeCamera.emit();
  }

  /**
   * recordVideo
   */
   public recordVideo(mediaStream: MediaStream) {
    const mr =  new MediaRecorder(mediaStream);
    this.localRecorder = mr;
    let chunks = [];
    this.localRecorder.start();
    this.localRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };
    this.localRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        chunks = [];
        const videoFD = new FormData();
        videoFD.append('camera', this.cameraId);
        videoFD.append('file', new File([blob], moment().format('DD-MM-yyyy-HH-mm-ss') + '.mp4'), moment().format('DD-MM-yyyy-HH-mm-ss') + '.mp4');
        this._videoService.createVideo(videoFD).pipe(take(1)).subscribe((response: any) => {
          this.toastr.success('Video grabado perro');
          if(!this.last) {
            this.recordVideo(mediaStream);
            setTimeout(() => {
              this.stopVideo();
            }, 30000);
          }
        });
    };
  }

  /**
   * stopVideo
   */
  public stopVideo() {
    if (!this.last) {
      this.localRecorder.stop();
    }
  }

}
