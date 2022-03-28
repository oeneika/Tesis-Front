import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceDetection } from 'face-api.js';
declare var MediaRecorder: any;

@Component({
  selector: 'app-app-video-player',
  templateUrl: './app-video-player.component.html',
  styleUrls: ['./app-video-player.component.scss']
})
export class AppVideoPlayerComponent implements OnInit {

  @ViewChild("video", { static: false }) video: ElementRef;
  @ViewChild("canvas", { static: false }) canvasRef: ElementRef;
  @ViewChild("capture", { static: false }) captureRef: ElementRef;
  @ViewChild("prueba", { static: false }) prueba: ElementRef;
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
    navigator.mediaDevices.enumerateDevices().then(promise => console.log(promise))
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri("../../assets/models"),
      await faceapi.nets.faceLandmark68Net.loadFromUri("../../assets/models"),
      await faceapi.nets.faceRecognitionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.faceExpressionNet.loadFromUri("../../assets/models"),
      await faceapi.nets.ageGenderNet.loadFromUri("../../assets/models"),
    ]).then(() => this.startVideo());
  }

  startVideo() {
    this.videoInput = this.video.nativeElement;
    const p = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    p.then((mediaStream: MediaStream) => {
      this.video.nativeElement.srcObject = mediaStream;
      this.recordVideo(mediaStream);
    });
    this.detect_Faces();
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
            console.log(this.resizedDetections);
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
    const frame = canvas.getContext('2d').getImageData(0, 0, this.videoInput.offsetWidth, this.videoInput.offsetHeight);
    const length = frame.data.length;
    const data = frame.data;
    const video = document.getElementById('video');
    video.addEventListener('play', (event: any)=>{
      console.log('Ok', event);
    });
    
  }

  private compateImage() {
    const distance = faceapi.utils.round(
      faceapi.euclideanDistance(this.image1, this.image2)
    );
    console.log(distance);
  }
}
