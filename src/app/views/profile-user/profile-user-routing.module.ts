import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProfilePageComponent } from "./profile-user.component";

const routes: Routes = [
  {
    path: "",
    component: ProfilePageComponent,
    data: {
      title: "Perfil de usuario",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileUserRoutingModule {}
