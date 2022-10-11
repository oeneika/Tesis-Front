import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { RecordingsService } from "../../services/recordings.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { take } from "rxjs/operators";
import { environment } from "../../../environments/environment";

@Component({
  templateUrl: "recordings.component.html",
  providers: [UserService, RecordingsService],
})
export class RecordingsComponent implements OnInit {
  public identity;
  public recordings: any[] = [];
  public recording: any;
  public page:number = 1;
  //public face: Face;
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private _userService: UserService,
    private modalService: BsModalService,
    private _recordingsService : RecordingsService
  ) {
    this.identity = this._userService.identity;
  }

  ngOnInit() {
    this.getRecordings();
    if (!this.identity) {
      this.router.navigate(["login"]);
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg modal-dialog-centered",
    });
  }

  openRecordings(x, recording) {
    this.openModal(x);
    this.recording = recording;
  }

  /**
   * getPrettySize
   */
  public getPrettySize(size: string) {
    const _size = Number(size);
    return Math.fround(_size / 1000000).toFixed(2);
  }

  /**
   * getRecordings
   */
  public getRecordings(): void {
    this._recordingsService.getRecordings(this.identity).pipe(take(1)).subscribe((response:any) => {
      this.recordings = response;
    })
  }

  /**
   * downloadVideo
   */
  public downloadVideo(dataurl, filename): void {
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

  /**
   * videSrc
   */
  public videoSrc(fileName: string): string {
    return environment.url + 'get-video-file/'.concat(fileName);
  }
}
