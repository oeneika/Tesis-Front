import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceDetection } from 'face-api.js';
import { ToastrService } from 'ngx-toastr';
import { resolve } from 'path';
import { take } from 'rxjs/operators';
import { FaceService } from '../../../services/face.service';
import { NotificationService } from '../../../services/notifications.service';
import { UserService } from '../../../services/user.service';
declare var MediaRecorder: any;

@Component({
  selector: 'app-app-video-player',
  templateUrl: './app-video-player.component.html',
  styleUrls: ['./app-video-player.component.scss']
})
export class AppVideoPlayerComponent implements OnInit {

  public faces: any[] = [];
  public expressions: any = { 'angry': 'Molesto', 'disgusted': 'Asqueado', 'fearful': 'Atemorizado', 'happy': 'Feliz', 'neutral': 'Neutral', 'sad': 'Triste', 'surprised': 'Sorprendido' };
  public identity;
  @ViewChild("video", { static: false }) video: ElementRef;
  @ViewChild("canvas", { static: false }) canvasRef: ElementRef;
  @ViewChild("capture", { static: false }) captureRef: ElementRef;
  @ViewChild("prueba", { static: false }) prueba: ElementRef;
  @Input() cameraId: any;
  @Input() stream: any;
  //https://rushipanchariya.medium.com/how-to-use-face-api-js-for-face-detection-in-video-or-image-using-angular-fca1e4bef797
  public recognitions: any[] = [];
  constructor(private elRef: ElementRef, private _faceService: FaceService, private _userService: UserService, private notificationService: NotificationService, private toastr: ToastrService) {
    this.identity = this._userService.identity;
    this.loadFaces();
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
    navigator.mediaDevices.enumerateDevices();
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/models"),
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
    this._faceService.getFaceByUser(this.identity).pipe(take(1)).subscribe((response: any) => this.faces = response);
  }

  startVideo() {
    this.videoInput = this.video.nativeElement;
    const p = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    p.then((mediaStream: MediaStream) => {
      this.video.nativeElement.srcObject = mediaStream;
      this.recordVideo(mediaStream);
    });
    this.onVideoPlay();
    p.catch(function(err) { console.log(err.name); }); // always check for errors at the end.
  }

  /**
   * recordVideo
   */
  public recordVideo(mediaStream: MediaStream) {
    const mr =  new MediaRecorder(mediaStream);
    let chunks = [];
    mr.start();
    mr.ondataavailable = (e) => {
        chunks.push(e.data);
    };
    mr.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        chunks = [];
        const recordedMedia = document.createElement("video");
        recordedMedia.controls = true;
        const recordedMediaURL = URL.createObjectURL(blob);
        recordedMedia.src = recordedMediaURL;
        const downloadButton = document.createElement("a");
        downloadButton.download = "Recorded-Media";
        downloadButton.href = recordedMediaURL;
        downloadButton.innerText = "Download it!";
        downloadButton.onclick = () => {
            URL.revokeObjectURL(recordedMediaURL);
        };
    };
  }

  async onVideoPlay() {
    this.elRef.nativeElement
      .querySelector("video")
      .addEventListener("play", async () => {
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
    if (this.resizedDetections.length > 0 && this.captureCheck) {
      // En el campo resizedDetection esta toda la info de edad genero y toda la mierda, tambien donde esta la cara de la gente para ver si recortas.
      this.capture(this.detection);
    }
    this.canvas
      .getContext("2d")
      .clearRect(0, 0, this.canvas.width, this.canvas.height);
    faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
    faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
    faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
  }

  private capture(detection: any[]) {
    console.log(this.videoInput);
    this.compareFaces(this.videoInput, detection);
    const canvas: HTMLCanvasElement = this.captureRef.nativeElement;
    canvas.setAttribute('width', this.videoInput.offsetWidth);
    canvas.setAttribute('height', this.videoInput.offsetHeight);
    canvas.getContext('2d').drawImage(this.videoInput, 0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
    const frame = canvas.getContext('2d').getImageData(0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
    const length = frame.data.length;
    const data = frame.data;
    const video = document.getElementById('video');
    video.addEventListener('play', (event: any)=>{
      // console.log('Ok', event);
    });

  }

  private async compareFaces(capturedFace: any, detection: any[]) {
    const _recognitions = [];
    for (const detect of detection) {
      let recognition = { user: null, msg: null, distance: 1 };
      for (const face of this.faces) {
        if (face?.image) {
          const distance = await this.imgComparison('http://localhost:8000/api/get-image-face/'.concat(face.image), capturedFace ? capturedFace : this.videoInput);
          if (distance <= 0.6 && distance < recognition.distance) {
            recognition.distance = distance;
            recognition.msg = 'Se reconoció a '.concat(face?.name, ' ', face?.surname);
            recognition.user = face?._id;
            console.log(distance, recognition);
          }
        }
      }
      recognition.user? _recognitions.push(recognition) && this.sendNotification(detect, recognition) :  undefined;
    }

    this.recognitions = [].concat(_recognitions);
    if (_recognitions.length === 0) {
      this.sendNotification(this.detection[0], null, true)
    }
    await this.detectFaces();
  }

  private sendNotification(detection: any, recognition: any, unknown?: boolean) {
    const faceExpression = { points: 0, exp: null };
    for (const expression in detection?.expressions) {
      if (Object.prototype.hasOwnProperty.call(detection?.expressions, expression)) {
        detection?.expressions[expression] > faceExpression.points ? (faceExpression.points = detection?.expressions[expression]) && (faceExpression.exp = expression) : undefined;
      }
    }
    if (!unknown) {
      const canvas: HTMLCanvasElement = this.captureRef.nativeElement;
      canvas.setAttribute('width', this.videoInput.offsetWidth);
      canvas.setAttribute('height', this.videoInput.offsetHeight);
      canvas.getContext('2d').drawImage(this.videoInput, 0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
      canvas.toBlob(
                      blob => {
                        console.log('File: ', new File([blob], recognition?.user.concat('.jpg')));
                        this.notificationService.createNotification({
                        gender: detection.gender,
                        age: Math.round(detection.age),
                        // imagen: new File([blob], recognition?.user.concat('.jpg')),
                        imagen: null,
                        camera: this.cameraId,
                        user: recognition?.user,
                        facialExpression: this.expressions[faceExpression.exp]
                      }).pipe(take(1)).subscribe(() => this.toastr);
                      },
                      "image/jpeg",
                      0.01 /* quality */
                  );
    } else {
      this.notificationService.createNotification({
      gender: detection.gender,
      age: Math.round(detection.age),
      // imagen: new File([blob], recognition?.user.concat('.jpg')),
      imagen: null,
      camera: this.cameraId,
      user: recognition?.user,
      facialExpression: this.expressions[faceExpression.exp]
    }).pipe(take(1)).subscribe(() => this.toastr);
    }
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

}
