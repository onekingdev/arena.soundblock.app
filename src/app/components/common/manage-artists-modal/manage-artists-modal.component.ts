import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Artist, ProjectArtist } from 'src/app/models/project';
import { FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ArtistListComponent } from '../artist-list/artist-list.component';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-manage-artists-modal',
  templateUrl: './manage-artists-modal.component.html',
  styleUrls: ['./manage-artists-modal.component.scss'],
})
export class ManageArtistsModalComponent implements OnInit {

  @Input() set artists(artists) {
    if(!artists)
    return;
    this._artists = [...artists];
    this.originalArtists = [...artists];
  }
  @Input() selectArtists: Artist[];
  @Input() set artistAdded(artistAdded) {
    if(artistAdded) {
      this.addedArtist = null;
    }
  }
  @Input() public artistAdding: boolean;
  @Input() public artistAddedError: any;
  @Input() originalArtists: Artist[];
  @Input() addedArtist: ProjectArtist;
  @Output() addArtist: EventEmitter<any> = new EventEmitter<any>()
  @Output() editArtist: EventEmitter<Artist> = new EventEmitter<Artist>();
  @Output() deleteArtist: EventEmitter<string> = new EventEmitter<string>();
  @Output() selectArtist: EventEmitter<Artist> = new EventEmitter<Artist>();
  @Output() newArtistAdd: EventEmitter<string> = new EventEmitter<string>();
  public _artists: Artist[];
  public artistName: string;
  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService
  ) { 
  }

  ngOnInit() {}

  openAddArtistModal() {
    const modalRef = this.modalService.show(ArtistListComponent, {
      ignoreBackdropClick: true,
      class: 'modal-sm modal-dialog-centered',
      initialState: {
        artists: this.selectArtists,
        originalArtists: this.originalArtists,
        selectedArtists: []
      }
    });
    modalRef.content.artistSelected
      .pipe(
        takeUntil(modalRef.onHidden)
      )
      .subscribe((artist) => {
        this.onSelectArtist(artist);
      })
    modalRef.content.artistAdded
      .pipe(
        takeUntil(modalRef.onHidden)
      )
      .subscribe((param) => {
        const {event, artistName} = param;
        this.artistName = artistName;
        this.onNewArtistAdd();
      })
    return modalRef.onHidden;
  }
  
  onDeleteArtist(artistUUID) {
    this.deleteArtist.emit(artistUUID);
  }

  onEditArtist(artist) {
    artist.editable = false;
    this.editArtist.emit(artist)
  }

  onArtistSearch() {
   this.selectArtists = 
   this.originalArtists.filter(artist => artist.artist_name.toLowerCase().includes(this.artistName));
  }

  onEditClick(artist) {
    this.originalArtists = [...this._artists];
    artist.editable = true;
  }

  onSelectArtist(artist) {
    this.addedArtist = {...artist, type:'primary' };
  }

  onAddArtist() {  
    this.addArtist.emit(this.addedArtist);
  }
  onNewArtistAdd() {
    this.newArtistAdd.emit(this.artistName);
  }
}

