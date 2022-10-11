import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  NbButtonModule,
  NbAlertModule,
  NbSelectModule,
  NbCardModule,
  NbDatepickerModule,
  NbSpinnerModule
} from '@nebular/theme';
import { ProjectInvitesComponent } from './project-invites.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NbButtonModule,
    NbAlertModule,
    NbSelectModule,
    NbCardModule,
    NbDatepickerModule,
    NbSpinnerModule,
  ],
  declarations: [
    ProjectInvitesComponent
  ],
  exports: [
    ProjectInvitesComponent
  ],
})
export class ProjectInvitesModule { }
