import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceSelectorComponent } from './components/service/service-selector/service-selector.component';
import { NbSelectModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
const components = [
  ServiceSelectorComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    NbSelectModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
  ],
  exports: [
    ...components
  ],
  providers:[
    BsModalService
  ]
})
export class SharedModule { }
