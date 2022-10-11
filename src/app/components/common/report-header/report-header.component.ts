import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-report-header",
  templateUrl: "./report-header.component.html",
  styleUrls: ["./report-header.component.scss"]
})

export class ReportHeaderComponent implements OnInit {
  @Input() tab: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {}
  
  navigate(url = '') {
    this.router.navigate([url]);
  }
}