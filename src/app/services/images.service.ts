import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class ImageService {
  public url: string;
  public userService = new UserService(this._http);
  public headersAuthorization = new HttpHeaders()
    .set("Authorization", this.userService.token)
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

    /**
     * createImage
     */
     public createImage(image: any) {
      return this._http.post(environment.url.concat('image'), image, {
        headers: this.headersAuthorization,
      });
    }


}
