// Angular
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { CameraComponent } from "./camera.component";
import { CameraDetailsComponent } from "./camera-details.component";
import { ListCamerasComponent } from "./list-cameras.component";
import { AppVideoPlayerComponent } from './app-video-player/app-video-player.component'
import { CameraRoutingModule } from "./camera-routing.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { FaceService } from "../../services/face.service";
import { NotificationService } from "../../services/notifications.service";
import { ImageService } from "../../services/images.service";
import { RecordingsService } from "../../services/recordings.service";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";

@NgModule({
  imports: [
    CommonModule,
    CameraRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
  ],
  declarations: [
    CameraComponent,
    CameraDetailsComponent,
    ListCamerasComponent,
    AppVideoPlayerComponent
  ],
  providers:[FaceService, NotificationService, ImageService, RecordingsService, ConfidenceLevelsService]
})
export class CameraModule {}
