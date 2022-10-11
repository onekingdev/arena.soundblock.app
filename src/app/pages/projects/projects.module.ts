import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { ProjectsPage } from './projects.page';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { NbButtonModule, NbSelectModule, NbAlertModule, NbSpinnerModule, NbTooltipModule, NbTabsetModule } from '@nebular/theme';
import { ProjectInvitesModule } from 'src/app/components/project/layout/project-invites/project-invites.module';
import { AnnouncementsComponent } from './announcements/announcements.component';
import { MatTabsModule} from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { MatIconModule } from '@angular/material/icon';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CollapseModule } from 'ngx-bootstrap/collapse';
const routes: Routes = [
  {
    path: '',
    component: ProjectsPage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageFooterPageModule,
    IonicModule,
    PipeModule,
    NbButtonModule,
    NbSelectModule,
    NbAlertModule,
    NbTabsetModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    CommonComponentsModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    NbSpinnerModule,
    NbTooltipModule,
    ProjectInvitesModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot()
  ],
  declarations: [ProjectsPage, AnnouncementsComponent],
  providers: [
    BsModalService
    
  ]
})
export class ProjectsPageModule { }
