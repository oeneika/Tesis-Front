import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-verification-email",
  templateUrl: "verification-email.component.html",
})
export class VerificationEmailComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  get email(): string {
    return localStorage.getItem('email');
  }
}
