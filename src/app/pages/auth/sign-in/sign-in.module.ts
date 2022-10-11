import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SignInPage } from './sign-in.page';
import { NbButtonModule, NbAlertModule, NbSelectModule, NbCardModule } from '@nebular/theme';
import { PageFooterPageModule } from '../../../layout/footer/page-footer.module';

const routes: Routes = [
  {
    path: '',
    component: SignInPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    RouterModule.forChild(routes),
    PageFooterPageModule
  ],
  declarations: [SignInPage]
})
export class SignInPageModule {}
