import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse, HttpResponse }
  from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, finalize, tap, first, sample, materialize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable()
export class MyInterceptor implements HttpInterceptor {
    constructor(private toastr: ToastrService, private spinner: NgxSpinnerService){}
    intercept(req : HttpRequest<any>, next : HttpHandler) : Observable<HttpEvent<any>> {
        console.log('Req: ', req);
        this.spinner.show();
        return next.handle(req).pipe(
            retry(2),
            tap(tap => this.onTap(tap, req)),
            catchError((error: HttpErrorResponse)  => this.errorHandler(error, req)),
            finalize(() => this.finalize()));
    }

    private onTap(response: any, req: HttpRequest<any>):void {
        if (response?.status  === 200) {
            if (this.isValidReq(req) && response?.body?.message) {
                const message = response?.body?.message;
                this.toastr.success(message ? message : 'Se ha  realizado la petición correctamente.');
            }
        }
    }

    private errorHandler(error: HttpErrorResponse, req : HttpRequest<any>): Observable<any> {
        console.log('Error: ', error);
        if (this.isValidReq(req) && error?.error?.message) {
            const message = error?.error?.message;
            this.toastr.error(message, null);
        } else if (!error?.error?.message) {
            const message = error?.message;
            this.toastr.error('Hay un problema en la conexión con el servidor, contacte a un administrador.');
            // this.toastr.error(message);
        }
        this.spinner.hide();
        return throwError(error);
    }

    private finalize():void {
        this.spinner.hide();
    }

    private isValidReq(req: HttpRequest<any>): boolean {
        return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    }
}