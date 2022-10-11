import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { IonicModule } from '@ionic/angular';
import { SetPage } from './set.page';
import { Routes, RouterModule } from '@angular/router';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';

const routes: Routes = [
  {
    path: '',
    component: SetPage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NbButtonModule,
    RouterModule.forChild(routes),
    PageFooterPageModule,
    NbSpinnerModule,
    NbInputModule,
    CommonComponentsModule,
  ],
  declarations: [SetPage]
})
export class SetPageModule {}
