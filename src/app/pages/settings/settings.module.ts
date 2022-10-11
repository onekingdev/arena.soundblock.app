import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbTabsetModule } from '@nebular/theme';
import { IonicModule } from '@ionic/angular';

import { SettingsPage } from './settings.page';
import { SettingsModule } from '../../components/settings.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { SettingsRoutingModule } from './settings-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsRoutingModule,
    NbTabsetModule,
    SettingsModule,
    PageFooterPageModule
  ],
  declarations: [SettingsPage]
})
export class SettingsPageModule {}
