import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RecordingsComponent } from "./recordings.component";

const routes: Routes = [
  {
    path: "",
    component: RecordingsComponent,
    data: {
      title: "Grabaciones",
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordingsRoutingModule {}
