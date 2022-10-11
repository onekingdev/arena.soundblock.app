import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NbUserModule, NbTreeGridModule, NbButtonModule, NbCardModule, NbSelectModule } from '@nebular/theme';

import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { ProjectComponentsModule } from 'src/app/components/project.module';
import { TeamPage } from './team.page';

const routes: Routes = [
  {
    path: '',
    component: TeamPage,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PageFooterPageModule,
    NbButtonModule,
    NbCardModule,
    NbSelectModule,
    CommonComponentsModule,
    ProjectComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TeamPage]
})
export class TeamPageModule { }
