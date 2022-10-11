import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule } from '@nebular/theme';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { GoPage } from './go.page';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { PipeModule } from 'src/app//core/pipes/pipe.module';

const routes: Routes = [
  {
    path: '',
    component: GoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    PageFooterPageModule,
    PipeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GoPage]
})
export class GoPageModule {}
