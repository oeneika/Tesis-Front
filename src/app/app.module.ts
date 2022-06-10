import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ClipboardModule } from "ngx-clipboard";
import { BsDatepickerConfig, BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { PERFECT_SCROLLBAR_CONFIG } from "ngx-perfect-scrollbar";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import {NgxPaginationModule} from 'ngx-pagination';

import {
  IconModule,
  IconSetModule,
  IconSetService,
} from "@coreui/icons-angular";

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

import { AppComponent } from "./app.component";

// Import containers
import { DefaultLayoutComponent } from "./containers";
import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { LoginComponent } from "./views/login/login.component";
import { RegisterComponent } from "./views/register/register.component";
import { VerficationCodeComponent } from "./views/verification-code/verification-code.component";
import { YourCodeComponent } from "./views/verification-code/your-code.component";

import { SocketIoConfig, SocketIoModule, Socket } from "ngx-socket-io";
import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from "@coreui/angular";

// Import routing module
import { AppRoutingModule } from "./app.routing";

// Import 3rd party components
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { TabsModule } from "ngx-bootstrap/tabs";
import { AlertModule } from "ngx-bootstrap/alert";
import { ChartsModule } from "ng2-charts";
import { WebcamComponent } from "./webcam/webcam.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MyInterceptor } from "./services/interceptor.service";
import { UserService } from "./services/user.service";

const config: SocketIoConfig = {
  // url: environment.shortURL + "/socket.io/?EIO=3",
  url: environment.shortURL,
};

const APP_CONTAINERS = [DefaultLayoutComponent];

@NgModule({
  imports: [
    BrowserModule,
    ClipboardModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AlertModule,
    HttpClientModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    FormsModule,
    AppSidebarModule,
    NgxSpinnerModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    IconModule,
    ToastrModule.forRoot(),
    IconSetModule.forRoot(),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
    SocketIoModule.forRoot(config),
    NgxPaginationModule,
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    P404Component,
    P500Component,
    LoginComponent,
    RegisterComponent,
    WebcamComponent,
    VerficationCodeComponent,
    YourCodeComponent,
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true },
    IconSetService,
    BsDatepickerConfig,
    UserService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
