import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class RecordingsService {
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

    /**
     * getRecordings
     */
    public getRecordings(idAdmin: string): Observable<any> {
      return this._http.get(environment.url + "get-videos-by-user/" + idAdmin, {
        headers: this.headersAuthorization,
      });
    }

}
