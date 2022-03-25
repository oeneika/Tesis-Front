// Angular
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ConfidenceLevelsComponent } from "./confidence-levels.components";
import { ConfidenceLevelsRoutingModule } from "./confidence-levels-routing.module";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { ModalModule } from "ngx-bootstrap/modal";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  imports: [
    CommonModule,
    ConfidenceLevelsRoutingModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    NgxPaginationModule
  ],
  declarations: [ConfidenceLevelsComponent],
})
export class ConfidenceLevelsModule {}
