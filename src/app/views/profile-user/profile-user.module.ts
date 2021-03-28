// Angular
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ProfilePageComponent } from "./profile-user.component";
import { ProfileUserRoutingModule } from "./profile-user-routing.module";

@NgModule({
  imports: [CommonModule, ProfileUserRoutingModule, FormsModule],
  declarations: [ProfilePageComponent],
})
export class ProfileUserModule {}
