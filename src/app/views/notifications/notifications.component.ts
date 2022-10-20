import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { take } from "rxjs/operators";
import { CamerasService } from "../../services/cameras.service";
import { NotificationService } from "../../services/notifications.service";
import moment from "moment";
import { Face } from "../../models/face";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { FaceService } from "../../services/face.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";

@Component({
  templateUrl: "notifications.component.html",
  providers: [UserService, ],
})
export class NotificationsComponent implements OnInit {
  public face: Face;
  public identity;
  public notifications: any[];
  public recording: any;
  public confidenceLevels: Array<any> = [];
  public cameras: any[] = [];
  // public
  public page:number = 1;
  //public face: Face;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private _userService: UserService,
    private _cameraService: CamerasService,
    private _confidenceLevels: ConfidenceLevelsService,
    private _faceService: FaceService,
    private _toastr: ToastrService,
    private _notificationService: NotificationService,
    private modalService: BsModalService,
  ) {
    this.identity = this._userService.identity;
  }

  ngOnInit() {
    this._cameraService.getCamerasByUser(this.identity).subscribe((success: any) => {
      this.cameras = success;
      this.getConfidenceLevels();
    });
  }

  public getConfidenceLevels() {
    this._confidenceLevels.getConfidenceLevels().subscribe((levels: any[]) => {
      this.confidenceLevels = levels;
      this.getNotifications();
    });
  }

  /**
   * getNotifications
   */
  public getNotifications() {
    this._notificationService.getNotificationsByUser(this.identity).subscribe((response: any[]) => {
      this.notifications = response;
    });
  }

  /**
   * selectedCameraName
   */
   public selectedCameraName(cameraId: string): string {
    return this.cameras?.find(cam => cam?.cameraId?._id === cameraId).cameraId?.name;
  }

  /**
   * imageFile
   */
   public imageFile(fileName: string): string {
    return environment.url + 'get-image/'.concat(fileName);
  }

  /**
   * prettyDate
   */
  public prettyDate(uglyDate: Date | string): string {
    return moment(uglyDate).format('MMMM DD, YYYY HH:mm a');
  }

  /**
   * downloadImage
   */
   public downloadImage(dataurl, filename): void {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', dataurl, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
      let urlCreator = window.URL || window.webkitURL;
      let imageUrl = urlCreator.createObjectURL(this.response);
      let tag = document.createElement('a');
      tag.href = imageUrl;
      tag.target = '_blank';
      tag.download = filename;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    };
    xhr.send();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg modal-dialog-centered",
    });
  }

  openNotification(x, notification: any) {
    this.recording = notification;
    this.face = new Face(this.recording?.face?._id, '', '', this.recording?.face?.age, this.recording?.face?.gender, this.recording.image, '', this.recording.user, true);
    notification?.seen ? this.openModal(x): this._notificationService.updateNotificationStatus(notification?._id, true).subscribe((response: any) => {
      this.openModal(x);
      this.getNotifications();
    });
  }

  /**
   * addToConfidenceLevels
   */
  public addToConfidenceLevels() {
    if (this.face.confidenceLevels !== '634ad8c8043dd000160b3585') {
      this.face.unknown = false;
    }
    if (this.face.surname && this.face.name && this.face.confidenceLevels) {
      this._faceService.editFace(this.face).subscribe(
        (data) => {
          this.face = data.face;
          this.modalRef.hide();
          this._toastr.success('Rostro agregado satisfactoriamente a los niveles de confianza');
          this.getNotifications();
        },
        (err) => {}
      );
    } else {
      this._toastr.error('Todos los campos son requeridos');
    }
  }

  /**
   * confidenceLevelText
  */
  public confidenceLevelText(confidenceLevelId: string): string {
    return this.confidenceLevels?.find((value: any) => value?._id === confidenceLevelId)?.title;
  }

}
