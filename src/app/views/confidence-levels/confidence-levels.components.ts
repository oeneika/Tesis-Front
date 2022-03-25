import { Component, OnInit, TemplateRef } from "@angular/core";
import { UserService } from "../../services/user.service";
import { FaceService } from "../../services/face.service";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { environment } from "../../../environments/environment";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Face } from "../../models/face";
import { take } from "rxjs/operators";
import { Console } from "console";
import { ToastrService } from "ngx-toastr";

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
  public photo_default = "../../../assets/img/avatars/default.png";
  public url: string;
  public page = 1;
  public count = 0;
  public tableSize;
  public returnedArray: string[];

  constructor(
    private _userService: UserService,
    private modalService: BsModalService,
    private _confidenceLevels: ConfidenceLevelsService,
    private _faceService: FaceService,
    private toastr: ToastrService
  ) {
    this.identity = this._userService.identity;
    this.token = this._userService.token;
    this.face = new Face("", "", "", "", "", "", "", "");
    this.url = environment.url;
  }

  ngOnInit() {
    this.getFaces();
  }

  public getConfidenceLevels(faces: any[]) {
    this._confidenceLevels.getConfidenceLevels().subscribe((levels: any[]) => {
      levels.map((level: any, i: number) => {
        level.faces = faces.filter((face: any) => face?.confidenceLevels === level?._id);
        level.paginationId = 'facesLevel' + (i + 1);
        level.currentPage = 1;
      });
      this.confidenceLevels = levels;
    });
  }

  public getFaces() {
    this._faceService.getFaceByUser(this.identity).pipe(take(1)).subscribe((response: any) => this.getConfidenceLevels(response));
  }

  //Abrir modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg modal-dialog-centered",
    });
  }

  editUser(x, user) {
    this.openModal(x);
    this.face = user;
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

  onSubmitEdit() {
    this._faceService.editFace(this.face).subscribe(
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
            this.toastr.success('El usuario ha sido editado con éxito.');
          });
        }

        this.getFaces();
        this.modalRef.hide();
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
            this.toastr.success('El usuario ha sido agregado con éxito.');
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
