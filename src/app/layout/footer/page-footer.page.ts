import { Component, OnInit } from '@angular/core';

import { environment } from 'src/environments/local';

@Component({
  selector: 'app-page-footer',
  templateUrl: './page-footer.page.html',
  styleUrls: ['./page-footer.page.scss']
})
export class PageFooterPage implements OnInit {

  cloudUrl = environment.cloudUrl;

  constructor() { }

  ngOnInit() { }
}
