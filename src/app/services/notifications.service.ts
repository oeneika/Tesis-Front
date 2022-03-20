import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { UserService } from "./user.service";

@Injectable()
export class NotificationService {
  public url: string;
  public userService = new UserService(this._http);
  public headersAuthorization = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Authorization", this.userService.token)
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

    /**
     * updateNotificationStatus
     */
     public updateNotificationStatus(notificationId: string, seen: boolean) {
      return this._http.put(environment.url.concat('update-notification/', notificationId), { 'seen': seen}, {
        headers: this.headersAuthorization,
      });
    }

    /**
     * getNotificationsByUser
     */
    public getNotificationsByUser(userId: string) {
      return this._http.get(environment.url.concat('notifications-by-user/', userId), {
        headers: this.headersAuthorization,
      });
    }

}
