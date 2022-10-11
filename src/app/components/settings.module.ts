import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {
  NbButtonModule,
  NbAlertModule,
  NbSelectModule,
  NbCardModule,
  NbDatepickerModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbDialogModule
} from '@nebular/theme';

import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { RouterModule } from '@angular/router';
import { HolderComponent } from './settings/account/holder/holder.component';
import { UpgradeComponent } from './settings/account/upgrade/upgrade.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ProjectsComponent } from './settings/projects/projects.component';

import { CommonComponentsModule } from './common.module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PipeModule,
    NbButtonModule,
    NbAlertModule,
    NbSelectModule,
    NbCardModule,
    NbDatepickerModule,
    RouterModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbDialogModule,
    CommonComponentsModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
  ],
  declarations: [
    UpgradeComponent,
    HolderComponent,
    ProjectsComponent
  ],
  exports: [
    UpgradeComponent,
    HolderComponent,
    ProjectsComponent
  ],
  providers:[
    BsModalService
  ]
})
export class SettingsModule { }
