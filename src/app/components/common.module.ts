import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule, NbAlertModule, NbTooltipModule, NbCardModule, NbSelectModule, NbBadgeModule } from '@nebular/theme';

import { ChartComponent } from './common/chart/chart.component';
import { MenuComponent } from './common/mobilemenu/mobilemenu.component';
import { UploadFileComponent } from './common/upload-file/upload-file.component';
import { NotificationComponent } from './common/notification/notification.component';
import { UsermenuComponent } from './common/usermenu/usermenu.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ProfileHeaderComponent } from './common/profile-header/profile-header.component';
import { AlertDialogComponent } from './common/alert-dialog/alert-dialog.component';
import { TicketSidebarComponent } from './ticketbar/ticketbar.component';
import { ToastComponent } from './common/toast/toast.component';
import { BlockchainViewerComponent } from './common/blockchain-viewer/blockchain-viewer.component';
import { ServiceTypeComponent } from './common/service-type/service-type.component';
import { PaginationComponent } from './common/pagination/pagination.component';

import { PipeModule } from 'src/app//core/pipes/pipe.module';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { DragDropDirective } from '../core/directives/drag-drop';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { DeleteConfirmationComponent } from './common/delete-confirmation/delete-confirmation.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ManageArtistsModalComponent } from './common/manage-artists-modal/manage-artists-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DeleteArtistComponent } from './common/delete-artist/delete-artist.component';
import { AddArtistComponent } from './common/add-artist/add-artist.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { StepperComponent } from './common/stepper-component/stepper.component';
import { AddArtistPublisherComponent } from './common/add-artist-publisher/add-artist-publisher.component';
import { DeleteArtistPublisherComponent } from './common/delete-artist-publisher/delete-artist-publisher.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ReportHeaderComponent } from './common/report-header/report-header.component';
import { ArtistCropComponent } from './common/artist-crop/artist-crop.component';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { ArtistListComponent } from './common/artist-list/artist-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    NbButtonModule,
    NbAlertModule,
    NbTooltipModule,
    NbCardModule,
    NbSelectModule,
    NbBadgeModule,
    DragDropModule,
    NgSelectModule,
    TooltipModule.forRoot(),
    ReactiveFormsModule,
    ModalModule.forChild(),
    AccordionModule.forRoot(),
    BsDropdownModule.forRoot(),
    TypeaheadModule.forRoot(),
    AngularCropperjsModule
  ],
  declarations: [
    ChartComponent,
    MenuComponent,
    UploadFileComponent,
    DragDropDirective,
    TicketSidebarComponent,
    UsermenuComponent,
    NotificationComponent,
    ProfileHeaderComponent,
    AlertDialogComponent,
    ToastComponent,
    DeleteConfirmationComponent,
    BlockchainViewerComponent,
    ServiceTypeComponent,
    PaginationComponent,
    ManageArtistsModalComponent,
    DeleteArtistComponent,
    AddArtistComponent,
    AddArtistPublisherComponent,
    DeleteArtistPublisherComponent,
    StepperComponent,
    ReportHeaderComponent,
    ArtistCropComponent,
    ArtistListComponent
  ],
  exports: [
    ChartComponent,
    MenuComponent,
    UploadFileComponent,
    DragDropDirective,
    TicketSidebarComponent,
    UsermenuComponent,
    StepperComponent,
    NotificationComponent,
    ProfileHeaderComponent,
    AlertDialogComponent,
    ToastComponent,
    BlockchainViewerComponent,
    ServiceTypeComponent,
    PaginationComponent,
    ManageArtistsModalComponent,
    DeleteArtistComponent,
    AddArtistComponent,
    AddArtistPublisherComponent,
    DeleteArtistPublisherComponent,
    ReportHeaderComponent,
    ArtistCropComponent,
    ArtistListComponent
  ],
  providers: [
    { provide: MatDialogRef, useValue: {}} ,
    { provide: MatDialog, useValue: {} },
    BsModalService
  ]
})

export class CommonComponentsModule { }