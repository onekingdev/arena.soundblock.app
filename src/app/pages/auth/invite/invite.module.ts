import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbButtonModule } from '@nebular/theme';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';

import { InvitePage } from './invite.page';
import { InviteResolver } from 'src/app/core/resolvers/invite.resolver';
import { PageFooterPageModule } from 'src/app/layout/footer/page-footer.module';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: '',
    component: InvitePage,
    resolve: [InviteResolver]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageFooterPageModule,
    NbButtonModule,
    NgSelectModule
  ],
  declarations: [InvitePage]
})
export class InvitePageModule {}
