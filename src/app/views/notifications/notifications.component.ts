import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { take } from "rxjs/operators";
import { CamerasService } from "../../services/cameras.service";
import { NotificationService } from "../../services/notifications.service";
import moment from "moment";

@Component({
  templateUrl: "notifications.component.html",
  providers: [UserService, ],
})
export class NotificationsComponent implements OnInit {
  public identity;
  public notifications: any[];
  public recording: any;
  public cameras: any[] = [];
  // public 
  public page:number = 1;
  //public face: Face;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private _userService: UserService,
    private _cameraService: CamerasService,
    private _notificationService: NotificationService,
    private modalService: BsModalService, 
  ) {
    this.identity = this._userService.identity;
  }

  ngOnInit() {
    this._cameraService.getCamerasByUser(this.identity).subscribe((success: any) => {
      this.cameras = success;
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
    return 'http://localhost:8000/api/get-image-file/'.concat(fileName);
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
    console.log(...arguments)
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
    notification?.seen ? this.openModal(x): this._notificationService.updateNotificationStatus(notification?._id, true).subscribe((response: any) => {
      this.openModal(x);
      this.getNotifications();
    })
  }

}
