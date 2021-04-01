// Angular
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { CameraComponent } from "./camera.component";
import { CameraDetailsComponent } from "./camera-details.component";
import { ListCamerasComponent } from "./list-cameras.component";

import { CameraRoutingModule } from "./camera-routing.module";
import { ModalModule } from "ngx-bootstrap/modal";

@NgModule({
  imports: [
    CommonModule,
    CameraRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
  ],
  declarations: [CameraComponent, CameraDetailsComponent, ListCamerasComponent],
})
export class CameraModule {}
