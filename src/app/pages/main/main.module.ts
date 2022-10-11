import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { MainPage } from './main.page';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    PageFooterPageModule,
    ModalModule.forRoot(),
    NgSelectModule
  ],
  declarations: [MainPage],
  providers:[
    BsModalService,
  ]
})
export class MainPageModule {}
