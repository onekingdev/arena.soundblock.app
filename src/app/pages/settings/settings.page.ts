import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  get url() {
    return this.router.url;
  }

  constructor(private router: Router) { }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
