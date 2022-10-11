import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AlertModule } from 'ngx-bootstrap/alert';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  NbUserModule,
  NbTreeGridModule,
  NbCardModule,
  NbDialogModule,
  NbButtonModule,
  NbSelectModule,
  NbAlertModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbDatepickerModule
} from '@nebular/theme';

import { PipeModule } from '../core/pipes/pipe.module';
import { CommonComponentsModule } from 'src/app/components/common.module';
import { AssettableComponent } from './project/table/assettable/assettable.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TeamtableComponent } from './project/table/teamtable/teamtable';
// Layouts
import { HistorybarComponent } from './project/layout/historybar/historybar';
import { TabheaderComponent } from './project/layout/tabheader/tabheader';
import { InfoheaderComponent } from './project/layout/infoheader/infoheader.component';
// Dialogs
import { HistorydialogComponent } from './project/dialog/historydialog/historydialog.component';
import { FilehistoryComponent } from './project/dialog/filehistory/filehistory.component';
import { OrganizeComponent } from './project/dialog/collection/organize/organize.component';
import { FolderComponent } from 'src/app/components/project/dialog/collection/folder/folder.component';
import { UploadComponent } from 'src/app/components/project/dialog/collection/upload/upload.component';
import { ConfirmComponent } from 'src/app/components/project/dialog/collection/confirm/confirm.component';
import { DetailComponent } from 'src/app/components/project/dialog/collection/detail/detail.component';
import { SummaryComponent } from 'src/app/components/project/dialog/collection/summary/summary.component';
import { QueuedialogComponent } from 'src/app/components/project/dialog/collection/queuedialog/queuedialog.component';
import { BlockchainComponent } from 'src/app/components/project/dialog/blockchain/blockchain.component';
import { ModifyContractComponent } from 'src/app/components/project/dialog/modify-contract/modify-contract.component';
import { SelectCollectionComponent } from './project/dialog/collection/select-collection/select-collection.component';
import { EditProjectComponent } from './project/dialog/edit-project/edit-project.component';
import { AddTeamMemberComponent } from './project/dialog/add-team-member/add-team-member.component';
import { UploadArtworkComponent } from './project/dialog/collection/upload-artwork/upload-artwork.component';
import { TrackPreviewsComponent } from './project/layout/track-previews/track-previews.component';
import { TrackPreviewComponent } from './project/dialog/collection/track-preview/track-preview.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TrackInfoComponent } from './project/dialog/collection/track-info/track-info.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { TrackDetailComponent } from './project/track-detail/track-detail.component';
import { AddLyricsComponent } from './project/dialog/add-lyrics/add-lyrics.component';
import { AddNotesComponent } from './project/dialog/add-notes/add-notes.component';
import { LyricsComponent } from './project/dialog/lyrics/lyrics.component';
import { DeleteLyricsComponent } from './project/dialog/delete-lyrics/delete-lyrics.component';
import { DeleteNotesComponent } from './project/dialog/delete-notes/delete-notes.component';
import { NotesComponent } from './project/dialog/notes/notes.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {DatabaseTableComponent} from './project/table/database-table/database-table.component';
import { BsModalService, ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { TrackArtistPublishersComponent } from './project/dialog/track-artist-publishers/track-artist-publishers.component';
import { AddTrackPublisherComponent } from './project/dialog/add-track-publisher/add-track-publisher.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TrackArtistsComponent } from './project/dialog/track-artists/track-artists.component';
import { ArtistPublishersComponent } from './project/dialog/artist-publishers/artist-publishers.component';
import { TrackContributorComponent } from './project/dialog/collection/track-contributor/track-contributor.component';
import { DeleteTrackContributorComponent } from './project/dialog/collection/delete-track-contributor/delete-track-contributor.component';
import { PreviewComponent } from './project/dialog/collection/preview/preview.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NbUserModule,
    CdkStepperModule,
    NbTreeGridModule,
    PipeModule,
    NbCardModule,
    NbDialogModule,
    BsDropdownModule.forRoot(),
    NbButtonModule,
    NbSelectModule,
    NbAlertModule,
    NbTooltipModule,
    DragDropModule,
    ReactiveFormsModule,
    CommonComponentsModule,
    NbSpinnerModule,
    AlertModule.forRoot(),
    CollapseModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    NbDatepickerModule,
   TooltipModule.forRoot(), 
   AccordionModule.forRoot(),
    NbAlertModule,
    NgxDatatableModule,
    ModalModule.forChild(),
  ],
  declarations: [
    HistorybarComponent,
    TabheaderComponent,
    TeamtableComponent,
    AssettableComponent,
    InfoheaderComponent,
    HistorydialogComponent,
    ArtistPublishersComponent,
    FilehistoryComponent,
    OrganizeComponent,
    FolderComponent,
    UploadComponent,
    ConfirmComponent,
    DetailComponent,
    TrackInfoComponent,
    SummaryComponent,
    TrackDetailComponent,
    BlockchainComponent,
    TrackArtistPublishersComponent,
    TrackContributorComponent,
    AddTrackPublisherComponent,
    DeleteTrackContributorComponent,
    AddLyricsComponent,
    TrackArtistsComponent,
    AddNotesComponent,
    ModifyContractComponent,
    QueuedialogComponent,
    SelectCollectionComponent,
    DeleteNotesComponent,
    NotesComponent,
    EditProjectComponent,
    AddTeamMemberComponent,
    UploadArtworkComponent,
    DeleteLyricsComponent,
    TrackPreviewsComponent,
    PreviewComponent,
    TrackPreviewComponent,
    LyricsComponent,
    DatabaseTableComponent
  ],
  exports: [
    HistorybarComponent,
    TabheaderComponent,
    TeamtableComponent,
    AssettableComponent,
    InfoheaderComponent,
    PreviewComponent,
    HistorydialogComponent,
    FilehistoryComponent,
    OrganizeComponent,
    FolderComponent,
    BlockchainComponent,
    ModifyContractComponent,
    QueuedialogComponent,
    EditProjectComponent,
    UploadArtworkComponent,
    TrackPreviewsComponent,
    TrackPreviewComponent,
    DatabaseTableComponent
  ],
  providers: [
    BsModalService,
    BsModalRef
  ]
  
})
export class ProjectComponentsModule { }
