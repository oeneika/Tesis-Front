import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class CamerasService {
  public url: string;
  public userService = new UserService(this._http);
  public headersAuthorization = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Authorization", this.userService.token)
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

    //Agregar Face
    addCamera(camera): Observable<any> {
      let json = JSON.stringify(camera);
      let params = json;
      return this._http.post(environment.url.concat("save-camera"), params, {
        headers: this.headersAuthorization,
      });

    }

    //Obtener Face
    public getCamerasByUser(idUser?: string): Observable<any> {
        return this._http.get(environment.url + "get-cameras-by-user/" + (idUser ? idUser : JSON.parse(localStorage.getItem('identity'))), {
          headers: this.headersAuthorization,
        });
    }

    public getCamera(idCamera): Observable<any> {
      return this._http.get(environment.url + "get-camera/" + idCamera, {
        headers: this.headersAuthorization,
      });
    }

    public get idCamera() {
      return localStorage.getItem("idCamera") || null;
    }

}
