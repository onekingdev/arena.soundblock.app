import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Contract, Team } from 'src/app/models/team';
import { ProjectService } from 'src/app/services/project/project';
import Pusher from 'pusher-js';
import { environment } from '../../../../environments/local';
import { AuthService } from '../../../services/account/auth';

@Component({
  selector: 'app-people',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
})
export class TeamPage implements OnInit {
  team: Team;
  projectId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(routeParams => {
      this.projectId = routeParams.id;
      this.getProjectTeam();
      this.subscribeToTeamChannel();
    });
  }

  navigate(url: string) {
    this.router.navigate([`/project/${this.projectId}/${url}`]);
  }

  getProjectTeam() {
    // Show loading
    this.team = null;

    this.projectService.getProjectTeam(this.projectId)
      .subscribe(res => {
        this.team = res.team;
      }, (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/projects']);
        }
      });
  }

  private subscribeToTeamChannel() {
    const pusher = new Pusher(environment.pusherApiKey, {
      authEndpoint: `${environment.apiUrl}broadcasting/auth`,
      cluster: environment.pusherCluster,
      forceTLS: true,
      encrypted: true,
      auth: {
        params: {},
        headers: {
          Authorization: `Bearer ${this.authService.accessToken}`
        }
      },
    });

    const channel = pusher.subscribe(`private-channel.app.soundblock.project.${this.projectId}.team`);

    channel.bind(`Soundblock.Project.${this.projectId}.Team`, (team: Team) => {
      this.team = team;
    });
  }
}
