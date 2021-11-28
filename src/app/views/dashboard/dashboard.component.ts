import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { FaceService } from "../../services/face.service";
import { Face } from "../../models/face";
import { environment } from "../../../environments/environment";
import { UserService } from "../../services/user.service";

@Component({
  templateUrl: "dashboard.component.html",
    providers: [ConfidenceLevelsService, FaceService, UserService],
})
export class DashboardComponent implements OnInit {
    modalRef: BsModalRef;
    public confidenceLevels: Array<any> = [];
    public niveles = [];
    public face: Face;
    public token;
    public identity;
    public url: string;
    public rostros = [];
    public tableSize;


  constructor(private modalService: BsModalService, private _confidenceLevels: ConfidenceLevelsService,private _faceService: FaceService,private _userService: UserService,){
      this.face = new Face("", "", "", "", "", "", "", "");
      this.token = this._userService.getToken();
      this.identity = this._userService.getIdentity();
      this.url = environment.url;
      
  }
  ngOnInit(){
    this.getConfidenceLevels()
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
        this.face = new Face("", "", "", "", "", "", "", "");
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
