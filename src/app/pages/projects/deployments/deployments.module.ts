import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { NbButtonModule, NbSelectModule, NbCardModule, NbDialogModule, NbTooltipModule, NbCheckboxModule, NbSpinnerModule } from '@nebular/theme';

import { DeploymentsPage } from './deployments.page';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { ProjectComponentsModule } from 'src/app/components/project.module';
import { PipeModule } from 'src/app/core/pipes/pipe.module';

const routes: Routes = [
  {
    path: '',
    component: DeploymentsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    NbSelectModule,
    NbCardModule,
    NbDialogModule,
    RouterModule.forChild(routes),
    PageFooterPageModule,
    ProjectComponentsModule,
    PipeModule,
    NbTooltipModule,
    NbCheckboxModule,
    NbSpinnerModule
  ],
  declarations: [DeploymentsPage]
})
export class DeploymentsPageModule { }
