import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { NotificationsComponent } from "./notifications.component";
import { NotificationsRoutingModule } from "./notifications-routing.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { NgxPaginationModule } from "ngx-pagination";
import { NotificationService } from "../../services/notifications.service";
import { CamerasService } from "../../services/cameras.service";
import { UserService } from "../../services/user.service";
import { ConfidenceLevelsService } from "../../services/confidence-levels.service";
import { FaceService } from "../../services/face.service";

@NgModule({
  imports: [
    FormsModule,
    NotificationsRoutingModule,
    BsDropdownModule,
    CommonModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    NgxPaginationModule
  ],
  declarations: [NotificationsComponent],
  providers: [NotificationService, CamerasService, UserService, ConfidenceLevelsService, FaceService]
})
export class NotificationsModule {}
