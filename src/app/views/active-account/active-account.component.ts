import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-active-account",
  templateUrl: "active-account.component.html",
})
export class ActiveAccountComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    localStorage.setItem("token", JSON.stringify(this.activeRoute.snapshot.paramMap.get("token")));
  }
}
