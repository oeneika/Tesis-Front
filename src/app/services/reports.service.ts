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

    public getFacesByCameraAndMonth(idAdmin): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-month/" + idAdmin, {
          headers: this.headersAuthorization,
        });
    }

    public getFacesByCameraAndWeek(idAdmin): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-week/" + idAdmin, {
            headers: this.headersAuthorization,
        });
    }

    public getFacesByCameraAndDay(idAdmin): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-day/" + idAdmin, {
          headers: this.headersAuthorization,
        });
    }

    //Formato: DD/MM/YYYY
    public getFacesByCameraAndDate(idAdmin, initialDate, finalDate): Observable<any> {
        return this._http.get(environment.url + "get-faces-by-camara-and-date/" + idAdmin + "?initialDate=" + initialDate + "&finalDate=" + finalDate, {
          headers: this.headersAuthorization,
        });
    }

}
