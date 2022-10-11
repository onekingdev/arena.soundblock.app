import { ArtistsComponent } from './artists.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ArtistsComponent
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PageFooterPageModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ModalModule.forChild(),
    CommonComponentsModule,
  ],
  declarations: [ArtistsComponent],
  providers: [
    BsModalService
    
  ]
})
export class ArtistsModule { }
