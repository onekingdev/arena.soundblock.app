import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { EmailConfirmPage } from './email-confirm.page';

const routes: Routes = [
  {
    path: '',
    component: EmailConfirmPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PageFooterPageModule,
    RouterModule.forChild(routes),
    NbSpinnerModule,
    NbButtonModule
  ],
  declarations: [EmailConfirmPage]
})
export class EmailConfirmPageModule {}
