import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MatDialogModule } from '@angular/material/dialog';
import { NbContextMenuModule, NbPopoverModule, NbCardModule, NbBadgeModule, NbButtonModule } from '@nebular/theme';
import { HeaderPage } from './header.page';
import { CommonComponentsModule } from 'src/app/components/common.module';

const routes: Routes = [
  {
    path: '',
    component: HeaderPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbContextMenuModule,
    NbPopoverModule,
    NbButtonModule,
    NbBadgeModule,
    NbCardModule,
    MatDialogModule,
    CommonComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HeaderPage],
  exports: [HeaderPage]
})
export class HeaderPageModule { }
