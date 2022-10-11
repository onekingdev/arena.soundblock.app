import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project/project';
import { Draft } from 'src/app/models/draft';

import { environment } from 'src/environments/local';
import { ProfileService } from 'src/app/services/account/profile';

@Component({
  selector: 'app-go',
  templateUrl: './go.page.html',
  styleUrls: ['./go.page.scss'],
})
export class GoPage implements OnInit {
  cloudUrl = environment.cloudUrl;

  authState: {
    username: string,
    email: string,
    plan: string,
    confirm: string
  };

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private profileService: ProfileService
  ) {
    const navigation = this.router.getCurrentNavigation();

    this.authState = navigation.extras.state as {
      username: string,
      email: string,
      plan: string,
      confirm: string
    };

    this.profileService.userHasService = true;
  }

  ngOnInit() { }

  createProject() {
    this.projectService.projectDraft.next(new Draft());
    this.router.navigate(['project/create']);
  }

  onFinish() {
    this.router.navigate(['/home']);
  }
}
