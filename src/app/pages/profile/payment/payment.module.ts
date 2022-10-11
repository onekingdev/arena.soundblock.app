import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NbSelectModule, NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { PaymentPage } from './payment.page';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';

const routes: Routes = [
  {
    path: '',
    component: PaymentPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    ReactiveFormsModule,
    CommonComponentsModule,
    PageFooterPageModule,
    NbSelectModule,
    NbButtonModule,
    RouterModule.forChild(routes),
    NbSpinnerModule
  ],
  declarations: [PaymentPage]
})
export class PaymentPageModule {}
