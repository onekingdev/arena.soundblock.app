import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { EditableTrackItemsFlag, ArtistPublisher, Artist } from 'src/app/models/project';
import { FormBuilder, FormArray } from '@angular/forms';
import { CollectionFile, Lyrics, Note, Contributor } from 'src/app/models/collection';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { TrackArtistPublishersComponent } from '../dialog/track-artist-publishers/track-artist-publishers.component';
import { AlertDialogComponent } from '../../common/alert-dialog/alert-dialog.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-track-detail',
  templateUrl: './track-detail.component.html',
  styleUrls: ['./track-detail.component.scss'],
})
export class TrackDetailComponent implements OnInit, OnChanges {
  // @Input() set files(files) {
  //   this._files = files;
  // };

  @Input() files;
  
  @Input() checkArray = [];
  @Input() Permissions;
  @Input() trackDownloadPermission: boolean;
  @Input() trackEditPermission: boolean;
  @Input() trackRestorePermission: boolean;
  @Input() trackDeletePermission: boolean;
  @Input()
  trackUUIDLoading: string;
  @Input() userPermissions: Permissions[];
  @Input() trackUUIDPlaying: string;
  @Input() downloadTrackProgress: string;
  @Input() isRecentCollection: boolean;
  isCollapsed = [];
  trackEditableItems: EditableTrackItemsFlag;
  filesForm: FormArray;
  _files: CollectionFile[];
  @Output() checkBoxClicked: EventEmitter<{ file, index: number }> = 
  new EventEmitter<{ file: CollectionFile, index: number }>()
  @Output() trackPlayed: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() trackStopped: EventEmitter<any> = new EventEmitter<any>();
  @Output() openBlockchainDialog: EventEmitter<string> = new EventEmitter<string>();
  @Output() openHistory: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() downloadFile: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() editFile: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() deleteFile: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() restoreFile: EventEmitter<CollectionFile> = new EventEmitter<CollectionFile>();
  @Output() updateTrackMeta: EventEmitter<object> = new EventEmitter<object>(); 
  @Output() organizeMusic: EventEmitter<{files: CollectionFile[],track: string, replaceTrack: string}> = 
  new EventEmitter<{files: CollectionFile[],track: string, replaceTrack: string}>();
  @Output() addLyrics: EventEmitter<any> = new EventEmitter<any>();
  @Output() openLyrics:
  EventEmitter<{file:string, lyrics:Lyrics[]}> = new EventEmitter<{file:string, lyrics:Lyrics[]}>();
  @Output() openNotes:
  EventEmitter<{file:string, notes:Note[]}> = new EventEmitter<{file:string, notes:Note[]}>();
  @Output() openArtists: EventEmitter<{file, artists: Artist[], index}> = new EventEmitter<{file:string,artists:Artist[], index}>();
  @Output() openPublishers: EventEmitter<{file: string, publishers: ArtistPublisher[]}> =
   new EventEmitter<{file: string, publishers: ArtistPublisher[]}>();
   @Output() openContributors: EventEmitter<{file: string, contributors: Contributor[]}> =
   new EventEmitter<{file: string, contributors: Contributor[]}>();
  changesUnsubscribe = new Subject();
  multipleVolumes : CollectionFile;
  
  constructor(private fb: FormBuilder, private bsModalService: BsModalService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this._files = this.files;
    this.filesForm = this.fb.array([])
    for (const [index, file] of this._files.entries()) {
      const fileForm = this.fb.group({
        recordingYear: [file?.track?.recording_year?file?.track?.recording_year:'...'],
        recordingLocation: [file.track?.recording_location?file.track?.recording_location:'...'],
        copyrightName: [file?.track?.copyright_name?file?.track?.copyright_name:'...'],
        copyrightYear: [file?.track?.copyright_year?file?.track?.copyright_year:'...'],
        rightsContract: [file?.track?.rights_contract?new Date(file?.track?.rights_contract):'...'],
        rightsHolder: [file?.track?.rights_holder?file?.track?.rights_holder:'...'],
        rightsOwner: [file?.track?.rights_owner?file?.track?.rights_owner:'...'],
        countryComissioning: [file?.track?.country_commissioning?file?.track?.country_commissioning:'...'],
        countryRecording: [file?.track?.country_recording?file?.track?.country_recording:'...'],
        isChecked: [this.checkArray[index]?this.checkArray[index]:null]
      }) 
      this.filesForm.push(fileForm);
    }
    this.multipleVolumes = this._files.find(file => file.track?.track_volume_number >1);
  }

  trackByFn(index, item) {
    return index;
  }

  drop(event: CdkDragDrop<string[]>) {
    if(
      event.previousIndex != event.currentIndex &&
      this._files[event.previousIndex].track?.track_volume_number == this._files[event.currentIndex].track?.track_volume_number
    ) {
     moveItemInArray(this._files, event.previousIndex, event.currentIndex);
     // this.organizeMusic.emit({files: this._files, volume_number: this._files[event.currentIndex].track?.track_volume_number});
    }
  }

  onArrowClick(fromIndex, toIndex, position) {
    if(
      toIndex!==-1 &&
      this._files[fromIndex].track?.track_volume_number === this._files[toIndex].track?.track_volume_number
    ) {
      this.arraymove(this._files,fromIndex,toIndex);
      this.organizeMusic
      .emit({files: this._files,
        track: this._files[fromIndex].track.track_uuid, replaceTrack: this._files[toIndex].track.track_uuid});
    }
    else {
      this.showReOrganizationError();
    }
  }

  arraymove(arr, fromIndex, toIndex) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

  clickCheckbox($event: MouseEvent,value: boolean, index: number) {
    $event.stopPropagation();
    const fileSave = {...this._files[index], isChecked: value};
    this.checkBoxClicked.emit({ file:fileSave, index });
  }

  playTrack(track: CollectionFile) {
    this.trackPlayed.emit(track);
  }

  stopPlayingTrack() {
    this.trackStopped.emit();
  }

  updateLyrics($event: MouseEvent, lyrics, file) {
    $event.stopPropagation();
    this.openLyrics.emit({file,lyrics});
  }

  updateFile($event: MouseEvent, file: CollectionFile) {
    $event.stopPropagation();
    this.editFile.emit(file);
  }

  updateNotes($event: MouseEvent, notes, file) {
    $event.stopPropagation();
    this.openNotes.emit({file, notes});
  }

  showBlockchainViewer($event: MouseEvent, ledgerId) {
    $event.stopPropagation();
    this.openBlockchainDialog.emit(ledgerId);
  }

  async showReOrganizationError() {
      const modal = await this.bsModalService.show(AlertDialogComponent,{
        class:'modal-dialog-centered',
        initialState: {
          title: 'Error',
          message:'This track cannot be moved in that direction without first changing the volume number.' ,
          description: ''
        }
      });
      modal.content.confirmed.pipe(takeUntil(modal.onHidden)).subscribe( res => {
        modal.hide();
      })
    }

  onHistory($event: MouseEvent, file) {
    $event.stopPropagation();
    this.openHistory.emit(file);
  }

  getMinutesAndSeconds(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    const hours = Math.floor(time / 3600);
    time = time - hours * 3600;
    let duration = '';
    if(hours>0) {
      duration = duration+hours+':'
    }
    if(minutes>0) {
      duration = duration+minutes+':';
    }
    return hours?hours+':':''+minutes?minutes+':':''+seconds;
  }


  onDownloadFile($event: MouseEvent, file: CollectionFile) {
    $event.stopPropagation();
    this.downloadFile.emit(file);
  }

  onDeleteFile($event: MouseEvent, file: CollectionFile) {
    $event.stopPropagation();
    this.deleteFile.emit(file);
  }

  onRestoreFile($event: MouseEvent, file: CollectionFile) {
    $event.stopPropagation();
    this.restoreFile.emit(file);
  }
  
  updateTrack(change, file: CollectionFile) {
    if(file.track && file?.track[Object.keys(change)[0]] !== change[Object.keys(change)[0]] && change[Object.keys(change)[0]] !=='...' ) {
      this.updateTrackMeta.emit({change,file_uuid:file?.file_uuid});
    }
  }

  updateContract(date, index) {
    if(+date !== +new Date(this._files[index]?.track?.rights_contract)) {
      this.updateTrack({rights_contract: date}, this._files[index]);
    }
  }

  onCheckboxClick($event: MouseEvent) {
    $event.stopPropagation();
  }

  onManagePublishers(index, file: string) {
    this.openPublishers.emit({file, publishers: this._files[index].track?.publisher});
  }

  onManageContributors(index, file: string) {
    this.openContributors.emit({file, contributors: this._files[index].track?.contributors});
  }

  onManageArtists(index, file: string) {
    this.openArtists.emit({file, artists: this._files[index]?.track?.artists, index});
  }
}
