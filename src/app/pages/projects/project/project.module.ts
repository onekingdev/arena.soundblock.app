import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NbTabsetModule, NbAlertModule, NbCardModule, NbTreeGridModule, NbButtonModule, NbTooltipModule, NbWindowModule } from '@nebular/theme';

import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { ProjectComponentsModule } from 'src/app/components/project.module';
import { ProjectResolver } from 'src/app/core/resolvers/project.resolver';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { ProjectPage } from './project.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectPage,
    resolve: [ProjectResolver]
  },
  {
    path: 'track-previews',
    component: ProjectPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbTabsetModule,
    NbAlertModule,
    NbCardModule,
    NbTreeGridModule,
    NbButtonModule,
    NbTooltipModule,
    NbWindowModule.forRoot(),
    RouterModule.forChild(routes),
    ProjectComponentsModule,
    PageFooterPageModule,
    CommonComponentsModule,
    DragDropModule,
    PipeModule,
    DragDropModule
  ],
  declarations: [ProjectPage],
})
export class ProjectPageModule { }
