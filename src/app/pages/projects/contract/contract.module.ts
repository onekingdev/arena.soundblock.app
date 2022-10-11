import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NbButtonModule, NbDialogModule, NbSpinnerModule, NbTooltipModule } from '@nebular/theme';

import { ContractPage } from './contract.page';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { ProjectComponentsModule } from 'src/app/components/project.module';
import { PipeModule } from '../../../core/pipes/pipe.module';
import { Routes, RouterModule } from '@angular/router';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';

const routes: Routes = [
  {
    path: '',
    component: ContractPage,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    NbDialogModule,
    PageFooterPageModule,
    CommonComponentsModule,
    ProjectComponentsModule,
    NbSpinnerModule,
    PipeModule,
    NbTooltipModule,
    RouterModule.forChild(routes),
    ModalModule.forChild(),
  ],
  declarations: [
    ContractPage
  ]
})
export class ContractPageModule { }
