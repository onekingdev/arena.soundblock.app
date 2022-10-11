import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfilePage } from './profile.page';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { NbSelectModule, NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    NbButtonModule,
    CommonComponentsModule,
    PageFooterPageModule,
    RouterModule.forChild(routes),
    NbSpinnerModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
