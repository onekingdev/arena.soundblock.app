import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from 'src/app/services/account/profile';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.page.html',
  styleUrls: ['./email-confirm.page.scss']
})
export class EmailConfirmPage implements OnInit {
  emailHash: string;
  emailVerified: boolean;
  emailError: string;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.emailHash = this.route.snapshot.params.hash;

    if (this.emailHash) {
      this.profileService
        .confirmEmailHash(this.emailHash)
        .subscribe(() => {
          this.emailVerified = true;
        }, (error: HttpErrorResponse) => {
          this.emailError = error?.error?.status?.message;
          this.emailVerified = false;
        });
    } else {
      this.router.navigate(['']);
    }
  }
}
