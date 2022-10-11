import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { SettingsPage } from './settings.page';
import { HolderComponent } from 'src/app/components/settings/account/holder/holder.component';
import { UpgradeComponent } from 'src/app/components/settings/account/upgrade/upgrade.component';
import { ProjectsComponent } from 'src/app/components/settings/projects/projects.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    children: [
      {
        path: '',
        redirectTo: 'accounts',
        pathMatch: 'full'
      },
      {
        path: 'projects',
        component: ProjectsComponent
      },
      {
        path: 'accounts',
        component: HolderComponent
      },
      {
        path: 'account/create',
        component: UpgradeComponent
      },
      {
        path: 'account/upgrade/:id',
        component: UpgradeComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {
}
