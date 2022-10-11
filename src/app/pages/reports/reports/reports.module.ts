import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { ReportsPage } from './reports.page';
import { PipeModule } from 'src/app/core/pipes/pipe.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {
  NbAlertModule,
  NbButtonModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTooltipModule,
  NbDatepickerModule,
  NbCalendarRangeModule, NbInputModule
} from '@nebular/theme';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SharedModule } from '../../../modules/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonComponentsModule } from 'src/app/components/common.module';
const routes: Routes = [
  {
    path: '',
    component: ReportsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    MatNativeDateModule,
    FormsModule,
    IonicModule,
    PageFooterPageModule,
    PipeModule,
    NbButtonModule,
    NbSelectModule,
    NbAlertModule,
    NbSpinnerModule,
    NbTooltipModule,
    NbDatepickerModule,
    MatTabsModule,
    MatIconModule,
    MatSelectModule,
    NbCalendarRangeModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatDatepickerModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    // TabsModule.forRoot(),
    NbInputModule,
    CommonComponentsModule,
  ],
  declarations: [ReportsPage]
})
export class ReportsPageModule {
}
