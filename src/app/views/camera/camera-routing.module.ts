import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CameraComponent } from "./camera.component";
import { ListCamerasComponent } from "./list-cameras.component";
import { CameraDetailsComponent } from "./camera-details.component";
import { CameraSharedWithMeComponent } from "./camera-shared-with-me";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Cámaras",
    },
    children: [
      {
        path: "",
        redirectTo: "cameras",
      },
      {
        path: "cameras",
        component: CameraComponent,
        data: {
          title: "Cámaras",
        },
      },
      {
        path: "list-cameras",
        component: ListCamerasComponent,
        data: {
          title: "Listado de cámaras",
        },
      },
      {
        path: "camera-shared-with-me",
        component: CameraSharedWithMeComponent,
        data: {
          title: "Cámaras compartidas conmigo",
        },
      },
      {
        path: "camera-details",
        component: CameraDetailsComponent,
        data: {
          title: "Detalles de la cámara",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CameraRoutingModule {}
