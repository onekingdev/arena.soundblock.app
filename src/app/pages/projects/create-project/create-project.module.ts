import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NbButtonModule, NbSelectModule, NbAlertModule, NbDatepickerModule, NbSpinnerModule, NbTooltipModule } from '@nebular/theme';

import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { CreateProjectComponent } from './create-project.component';
import { SharedModule } from '../../../modules/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ArtistsModule } from '../artists/artists.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AngularCropperjsModule } from 'angular-cropperjs';
const routes: Routes = [
  {
    path: '',
    component: CreateProjectComponent,
  }
];

@NgModule({
  declarations: [CreateProjectComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    NbSelectModule,
    NbAlertModule,
    NbDatepickerModule,
    NbTooltipModule,
    PageFooterPageModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbSpinnerModule,
    SharedModule,
    NgSelectModule,
    CommonComponentsModule,
    TooltipModule.forRoot(),
    ModalModule.forChild(),
    DragDropModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    AngularCropperjsModule
  ],
  providers: [
    BsModalService
  ]
})
export class CreateProjectModule { }
