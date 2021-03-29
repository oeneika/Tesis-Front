import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ConfidenceLevelsComponent } from "./confidence-levels.components";

const routes: Routes = [
  {
    path: "",
    component: ConfidenceLevelsComponent,
    data: {
      title: "Niveles de confianza",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfidenceLevelsRoutingModule {}
