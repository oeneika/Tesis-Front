import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { CamerasService } from "../../services/cameras.service";
import { ReportsService } from "../../services/reports.service"
import { FaceService } from "../../services/face.service";
import { Face } from "../../models/face";
import { environment } from "../../../environments/environment";
import { UserService } from "../../services/user.service";
import { take } from "rxjs/operators";
import moment from "moment";

@Component({
  templateUrl: "dashboard.component.html",
    providers: [ConfidenceLevelsService, FaceService, UserService, CamerasService, ReportsService],
})
export class DashboardComponent implements OnInit {
    modalRef: BsModalRef;
    public selectedCamera: string = null;
    public selectedFrequencyReport: string = 'daily';
    public selectedRange: any;
    public confidenceLevels: Array<any> = [];
    public page:number = 1;
    public pageAlt:number = 1;
    public cameras: Array<any> = [];
    public reportsbyDay: Array<any> = [];
    public reportsbyDate!: Array<any>;
    public reportsbyWeek: Array<any> = [];
    public reportsbyMonth: Array<any> = [];
    public niveles = [];
    public face: Face;
    public token;
    public identity;
    public url: string;
    public rostros = [];
    public tableSize;


  constructor(private modalService: BsModalService, private _camerasService: CamerasService, private _confidenceLevels: ConfidenceLevelsService,private _faceService: FaceService, private _reportsService: ReportsService,
    private _userService: UserService){
      this.face = new Face("", "", "", "", "", "", "", "", true);
      this.token = this._userService.token;
      this.identity = this._userService.identity;
      this.url = environment.url;

  }
  ngOnInit(){
    this.getConfidenceLevels();
    this.getCamerasByAdmin();
  }

  /**
   * getReportsByFrequency
   */
  public getReportsByFrequency() {
    if (this.selectedCamera) {
      this.getFacesByCameraAndDay();
      this.getFacesByCameraAndMonth();
      this.getFacesByCameraAndWeek();
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg modal-dialog-centered",
    });
  }

  getConfidenceLevels() {
    this._confidenceLevels.getConfidenceLevels().subscribe(
      (data) => {
        if (data != null && data != "") {
          this.confidenceLevels = data;
          this.niveles = this.confidenceLevels;
        }
      },
      (err) => {}
    );
  }

  /**
   * getFacesByCameraAndDate
   */
  public getFacesByCameraAndDate() {
    console.log(this.selectedRange, this.dateRange);

    this._reportsService.getFacesByCameraAndDate(this.selectedCamera, this.dateRange.from, this.dateRange.to).pipe(take(1)).subscribe((response: any) => {
      this.reportsbyDate = response;
    });
  }

  /**
   * dateRange
   */
  public get dateRange(): any {
    return this.selectedRange && this.selectedRange.length > 0 ?
    { from:  moment(this.selectedRange[0]).format('DD/MM/YYYY'), to: moment(this.selectedRange[1]).format('DD/MM/YYYY')} :
    null;
  }

  /**
   * selectedCameraName
   */
  public get selectedCameraName(): string {
    return this.cameras?.find(cam => cam?.cameraId?._id === this.selectedCamera).cameraId?.name;
  }

  /**
   * report
   */
  public get report(): any {
    switch (this.selectedFrequencyReport) {
      case 'monthly':
        return {list: this.reportsbyMonth, name: 'mensual'};
      case 'daily':
        return {list: this.reportsbyDay, name: 'diaria'};
      case 'weekly':
        return {list: this.reportsbyWeek, name: 'semanal'};
    }
  }

  /**
   * confidenceLevelDescription
   */
  public confidenceLevelDescription(levelId: string) {
    return this.confidenceLevels?.find(level => level?._id === levelId)?.title || 'Desconocido';
  }

  /**
   * imageFile
   */
  public imageFile(fileName: string): string {
    return environment.url + 'get-image/'.concat(fileName);
  }

  getCamerasByAdmin() {
    this._camerasService.getCamerasByUser(this.identity).pipe(take(1)).subscribe((response: any) => {
      this.cameras = response;
    });
  }

  //Reporte diario
  getFacesByCameraAndDay(){
    this._reportsService.getFacesByCameraAndDay(this.selectedCamera).subscribe((response: any) => {
        this.reportsbyDay = response;
    });
  }

    //Reporte semanal
    getFacesByCameraAndWeek(){
      this._reportsService.getFacesByCameraAndWeek(this.selectedCamera).subscribe((response: any) => {
        this.reportsbyWeek = response;
    });
    }

    //Reporte mensual
    getFacesByCameraAndMonth(){
      this._reportsService.getFacesByCameraAndMonth(this.selectedCamera).subscribe((response: any) => {
        this.reportsbyMonth = response;
    });
    }

    getFaces() {
    this._faceService.getFaceByUser(this.identity).subscribe(
      (data) => {
        if (data != null && data != "") {
          this.rostros = data;
          this.tableSize = this.rostros.length;
        }
      },
      (err) => {}
    );
  }

  onSubmit() {
    let payload = this.face;
    payload.user = this.identity;
    this._faceService.addFace(payload).subscribe(
      (data) => {
        this.face = data.face;
        localStorage.setItem("identity", JSON.stringify(this.identity));

        if (!this.filesToUpload) {
        } else {
          this.makeFileRequest(
            this.url + "upload-image-face/" + this.face._id,
            [],
            this.filesToUpload
          ).then((result: any) => {
            this.face.image = result.image;
            localStorage.setItem("identity", JSON.stringify(this.identity));
          });
        }
        this.face = new Face("", "", "", "", "", "", "", "", true);
        this.getFaces();
        this.modalRef.hide();
      },
      (err) => {}
    );
  }

  public filesToUpload: Array<File>;
  //Método de subir imagen
  fileChangeEvent(fileInput: any) {
    //Recoge los archivos que se pasan por input
    this.filesToUpload = <Array<File>>fileInput.target.files;
    console.log(this.filesToUpload);
  }

  makeFileRequest(url: string, params: Array<string>, file: Array<File>) {
    //pasar el token del usu identificado
    var token = this.token;

    return new Promise(function (resolve, reject) {
      var formData: any = new FormData();
      var xhr = new XMLHttpRequest();

      //recorrer los ficheros para subirlos
      for (var i = 0; i < file.length; i++) {
        formData.append("image", file[i], file[i].name);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      };

      //lanzar la petición
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Authorization", token);
      xhr.send(formData);
    });
  }
}
