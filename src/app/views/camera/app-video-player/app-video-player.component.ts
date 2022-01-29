import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceDetection } from 'face-api.js';

@Component({
  selector: 'app-app-video-player',
  templateUrl: './app-video-player.component.html',
  styleUrls: ['./app-video-player.component.scss']
})
export class AppVideoPlayerComponent implements OnInit {

  @ViewChild("video", { static: false }) video: ElementRef;
  @ViewChild("canvas", { static: false }) canvasRef: ElementRef;
  @ViewChild("capture", { static: false }) captureRef: ElementRef;
  @Input() stream: any;
  //https://rushipanchariya.medium.com/how-to-use-face-api-js-for-face-detection-in-video-or-image-using-angular-fca1e4bef797

  constructor(private elRef: ElementRef) {}
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
    console.log(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices().then(promise => console.log(promise))
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("../../assets/models"),
      await faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/models"),
      await faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.faceExpressionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.ageGenderNet.loadFromUri("../../assets/models"),
    ]).then(() => this.startVideo());
  }

  startVideo() {
    this.videoInput = this.video.nativeElement;
    navigator.getUserMedia(
      { video: {}, audio: false },
      (stream) => (this.videoInput.srcObject = stream),
      (err) => console.log(err)
    );
    this.detect_Faces();
  }

  async detect_Faces() {
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
        setInterval(async () => {
          this.detection = await faceapi
            .detectAllFaces(
              this.videoInput,
              new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
          this.resizedDetections  = faceapi.resizeResults(
            this.detection,
            this.displaySize
          );
          if (this.resizedDetections.length > 0 && this.captureCheck) {
            // En el campo resizedDetection esta toda la info de edad genero y toda la mierda, tambien donde esta la cara de la gente para ver si recortas.
            this.capture();
            if (this.image1 && this.image2) {
              this.captureCheck = false;
            }
          }
          this.canvas
            .getContext("2d")
            .clearRect(0, 0, this.canvas.width, this.canvas.height);
          faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
          faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
        }, 100);
      });
  }

  private async capture() {
    const canvas: HTMLCanvasElement = this.captureRef.nativeElement;
    canvas.setAttribute('width', this.videoInput.offsetWidth);
    canvas.setAttribute('height', this.videoInput.offsetHeight);
    canvas.getContext('2d').drawImage(this.videoInput, 0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
    // let image_data_url = canvas.toDataURL('image/jpeg');
    if (this.image1) {
      this.image2 =  await faceapi.computeFaceDescriptor(canvas);
    } else {
      this.image1 = await faceapi.computeFaceDescriptor(canvas);
    }

    if (this.image1 && this.image2) {
      this.compateImage();
    }
  }

  private compateImage() {
    const distance = faceapi.utils.round(
      faceapi.euclideanDistance(this.image1, this.image2)
    );
    console.log(distance);
  }
}
