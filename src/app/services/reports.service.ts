import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class ReportsService {
  public url: string;
  public userService = new UserService(this._http);
  public headersAuthorization = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Authorization", this.userService.token)
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

    public getFacesByCameraAndMonth(cameraId: string): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-month/" + cameraId, {
          headers: this.headersAuthorization,
        });
    }

    public getFacesByCameraAndWeek(cameraId: string): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-week/" + cameraId, {
            headers: this.headersAuthorization,
        });
    }

    public getFacesByCameraAndDay(cameraId: string): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-day/" + cameraId, {
          headers: this.headersAuthorization,
        });
    }

    //Formato: DD/MM/YYYY
    public getFacesByCameraAndDate(cameraId, initialDate, finalDate): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-date/" + cameraId + "?initialDate=" + initialDate + "&finalDate=" + finalDate, {
          headers: this.headersAuthorization,
        });
    }

}
