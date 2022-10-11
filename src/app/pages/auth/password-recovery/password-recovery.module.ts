import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { PasswordRecoveryPage } from './password-recovery.page';
import { PageFooterPageModule } from '../../../layout/footer/page-footer.module';

const routes: Routes = [
  {
    path: '',
    component: PasswordRecoveryPage
  },
  {
    path: ':hash',
    component: PasswordRecoveryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    PageFooterPageModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [PasswordRecoveryPage]
})
export class PasswordRecoveryPageModule { }
