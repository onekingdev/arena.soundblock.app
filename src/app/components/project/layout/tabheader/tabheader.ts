import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

enum ProjectTab {
  'PROJECT' = 'project',
  'CONTRACT' = 'contract',
  'DEPLOYMENTS' = 'deployments',
  'TEAM' = 'team',
  'DATABASE' = 'database'
}

@Component({
  selector: 'app-tabheader',
  templateUrl: './tabheader.html',
  styleUrls: ['./tabheader.scss'],
})
export class TabheaderComponent implements OnInit, OnDestroy {
  @Input() tab: ProjectTab;

  private destro$ = new Subject<void>();

  projectID: string;
  accountId: string;

  get ProjectTab() {
    return ProjectTab;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.watchProjectID();
  }

  watchProjectID() {
    this.activatedRoute.params.subscribe(params => {
      this.projectID = params.id;
    });
  }

  navigate(url = '') {
    if(url) {
      this.router.navigate(['project/'+this.projectID+'/'+url]);
    }
    else {
      this.router.navigate(['project/info/'+this.projectID]);
    }
  }

  ngOnDestroy() {
    this.destro$.next();
    this.destro$.complete();
  }
}
