import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ButtonsModule } from "ngx-bootstrap/buttons";
import { RecordingsComponent } from "./recordings.component";
import { RecordingsRoutingModule } from "./recordings-routing.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  imports: [
    FormsModule,
    RecordingsRoutingModule,
    BsDropdownModule,
    CommonModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    NgxPaginationModule
  ],
  declarations: [RecordingsComponent],
})
export class RecordingsModule {}
