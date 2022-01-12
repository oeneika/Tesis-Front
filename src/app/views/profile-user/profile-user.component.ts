import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../../models/user";
import { UserService } from "../../services/user.service";
import { COUNTRIES } from "../../utils/select.util";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-profile-page",
  templateUrl: "profile-user.component.html",
  providers: [UserService],
})
export class ProfilePageComponent implements OnInit {
  public user: User;
  public identity;
  public token;
  public usuario;
  public paises = COUNTRIES;
  public photo_default = "../../../assets/img/avatars/default.png";
  public url: string;

  constructor(private _userService: UserService, private router: Router) {
    this.identity = this._userService.identity;
    this.token = this._userService.token;
    this.url = environment.url;
  }

  ngOnInit() {
    if (!this.identity) {
      this.router.navigate(["login"]);
    }

    this._userService.getUser(this.identity).subscribe(
      (data) => {
        this.usuario = data.user;
        this.user = this.usuario;
        this.setPhoto();
      },
      (err) => {}
    );
  }

  public setPhoto() {
    if (this.user.image && this.user.image != null) {
      this.photo_default =
        "http://localhost:8000/api/get-image-file/" + this.user.image;
    }
  }

  public onSubmit() {
    let payload = this.user;
    this._userService.updatedUser(payload).subscribe(
      (data) => {
        this.usuario = data.userUpdated;
        localStorage.setItem("identity", JSON.stringify(this.identity));
        //subir la imagen
        if (!this.filesToUpload) {
          //redirección
        } else {
          this.makeFileRequest(
            this.url + "upload-image-user/" + this.user._id,
            [],
            this.filesToUpload
          ).then((result: any) => {
            this.user.image = result.image;
            localStorage.setItem("identity", JSON.stringify(this.identity));
            console.log(this.user);
            this.setPhoto();

            let image_path = this.url + "get-image-file/" + this.user.image;
            document
              .getElementById("image-logged")
              .setAttribute("style", `background-image: url(${image_path});`);
          });
        }
      },
      (err) => {
        console.log(err);
      }
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
