import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { NbSelectModule, NbButtonModule, NbTooltipModule, NbSpinnerModule } from '@nebular/theme';
import { ContactPage } from './contact.page';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';

const routes: Routes = [
  {
    path: '',
    component: ContactPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    NbSelectModule,
    NbButtonModule,
    CommonComponentsModule,
    PageFooterPageModule,
    RouterModule.forChild(routes),
    NbTooltipModule,
    NbSpinnerModule
  ],
  declarations: [ContactPage]
})
export class ContactPageModule {}
