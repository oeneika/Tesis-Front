import { Component, OnInit, TemplateRef } from "@angular/core";
import { UserService } from "../../services/user.service";
import { FaceService } from "../../services/face.service";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { environment } from "../../environments/environment";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Face } from "../../models/face";

@Component({
  selector: "app-confidence-levels",
  templateUrl: "confidence-levels.components.html",
  providers: [UserService, ConfidenceLevelsService, FaceService],
})
export class ConfidenceLevelsComponent implements OnInit {
  public face: Face;
  public identity;
  public token;
  modalRef: BsModalRef;
  public confidenceLevels: Array<any> = [];
  public niveles;
  public photo_default = "../../../assets/img/avatars/default.png";
  public url: string;
  public rostros;

  constructor(
    private _userService: UserService,
    private modalService: BsModalService,
    private _confidenceLevels: ConfidenceLevelsService,
    private _faceService: FaceService
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.face = new Face("", "", "", "", "", "", "", "");
    this.url = environment.url;
  }

  ngOnInit() {
    this._confidenceLevels.getConfidenceLevels().subscribe(
      (data) => {
        this.confidenceLevels = data;
        this.niveles = this.confidenceLevels;
      },
      (err) => {}
    );

    this.getFaces();
  }

  getFaces() {
    this._faceService.getFaceByUser(this.identity).subscribe(
      (data) => {
        this.rostros = data;
      },
      (err) => {}
    );
  }

  //Abrir modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  //Eliminar un rostro
  deleteFace(id) {
    this._faceService.removeFace(id).subscribe(
      (data) => {
        if (!data.faceRemoved) {
          alert("Error en el servidor");
        }

        this.getFaces();
      },
      (err) => {}
    );
  }

  onSubmit() {
    let payload = this.face;
    payload.user = this.identity;
    console.log(payload);
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
