import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-active-account",
  templateUrl: "active-account.component.html",
})
export class ActiveAccountComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }
}
