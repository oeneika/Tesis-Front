import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable()
export class UserService {
  public url: string;

  public headers = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Access-Control-Allow-Origin", "*");

  public headersAuthorization = new HttpHeaders()
    .set("content-type", "application/json")
    .set("Authorization", this.token)
    .set("Access-Control-Allow-Origin", "*");

  constructor(protected _http: HttpClient) {
    this.url = environment.url;
  }

  //Usuario entra al sistema
  signIn(user_to_login, gethash = null) {
    if (gethash != null) {
      user_to_login.gethash = gethash;
    }
    return this._http.post(
      environment.url.concat("login"),
      JSON.stringify(user_to_login),
      {
        headers: this.headers,
      }
    );
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
        token_secret: payload,
      },
      {
        headers: this.headers,
      }
    );
  }

  /**
   * setAuth
   */
  public setAuth(payload: any): Observable<any> {
    return this._http.put(
      environment.url.concat("set-authentication/", this.identity),
      payload,
      {
        headers: this.headersAuthorization,
      }
    );
  }

  public get identity() {
    return JSON.parse(
      localStorage.getItem("identity") ? localStorage.getItem("identity") : null
    );
  }

  public get token() {
    return localStorage.getItem("token") || null;
  }

  public get secret() {
    return JSON.parse(
      localStorage.getItem("secret") ? localStorage.getItem("secret") : null
    );
  }

  public get hasTwoStepsAuth() {
    return localStorage.getItem("hasTwoStepsAuth")
      ? JSON.parse(localStorage.getItem("hasTwoStepsAuth"))
      : null;
  }

  public get hasSetTwoSteps() {
    return JSON.parse(
      localStorage.getItem("hasSetTwoSteps")
        ? localStorage.getItem("hasSetTwoSteps")
        : null
    );
  }

  public get isTwoStepsAuth() {
    return JSON.parse(
      localStorage.getItem("isTwoStepsAuth")
        ? localStorage.getItem("isTwoStepsAuth")
        : null
    );
  }
}
