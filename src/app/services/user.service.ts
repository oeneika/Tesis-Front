import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable()
export class UserService {
  public url: string;
  public identity;
  public token;

  public headers = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Access-Control-Allow-Origin", "*");

  public headersAuthorization = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Authorization", this.getToken())
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

  //Usuario entra al sistema
  signIn(user_to_login, gethash = null) {
    if (gethash != null) {
      user_to_login.gethash = gethash;
    }
    let json = JSON.stringify(user_to_login);
    let params = json;

    return this._http.post(environment.url.concat("login"), params, {
      headers: this.headers,
    });
  }

  //Usuario entra al sistema
  signUp(user_to_register): Observable<any> {
    let json = JSON.stringify(user_to_register);
    let params = json;

    return this._http.post(environment.url.concat("register"), params, {
      headers: this.headers,
    });
  }

  //Actualizar usuario
  updatedUser(user_to_updated): Observable<any> {
    let json = JSON.stringify(user_to_updated);
    let params = json;

    return this._http.put(
      environment.url + "update-user/" + user_to_updated._id,
      params,
      {
        headers: this.headersAuthorization,
      }
    );
  }

  public getUser(idUser): Observable<any> {
    return this._http.get(environment.url + "get-user/" + idUser, {
      headers: this.headersAuthorization,
    });
  }

  public VerificationCode(payload, secret): Observable<any> {
    return this._http.post(
      environment.url.concat("verify"),
      {
        secret: secret,
        token_secret: payload.temp_secret,
      },
      {
        headers: this.headers,
      }
    );
  }

  getIdentity() {
    let identity = JSON.parse(localStorage.getItem("identity"));

    if (identity != "undefined") {
      this.identity = identity;
    } else {
      this.identity = null;
    }
    return this.identity;
  }

  getToken() {
    let token = JSON.parse(localStorage.getItem("token"));

    if (token != "undefined") {
      this.token = token;
    } else {
      this.token = null;
    }
    return this.token;
  }
}
