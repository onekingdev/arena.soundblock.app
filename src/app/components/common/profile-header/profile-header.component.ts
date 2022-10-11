import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
})
export class ProfileHeaderComponent implements OnInit {
  @Input() tab: any;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  navigate(url = '') {
    this.router.navigate([url]);
  }

}
