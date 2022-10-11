import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';

import { NbButtonModule, NbTooltipModule, NbIconModule } from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbButtonModule,
    PageFooterPageModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    PipeModule
  ],
  declarations: [HomePage],
})
export class HomePageModule { }
