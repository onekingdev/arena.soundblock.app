import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Artist } from 'src/app/models/project';

@Component({
  selector: 'app-artist-list',
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss'],
})
export class ArtistListComponent implements OnInit {
  @Input() public artists: Artist[];
  @Input() public originalArtists: Artist[];
  @Input() public selectedArtists: any;

  @Output() artistSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() artistAdded: EventEmitter<any> = new EventEmitter<any>();
  public artistName: string;
  constructor(
    public bsModalRef: BsModalRef
  ) { }

  onArtistSelect(artist) {
    this.artistSelected.emit(artist);
  }

  onArtistSearch() {
    this.artists = this.originalArtists.filter(artist => artist.artist_name.toLowerCase().includes(this.artistName));
  }

  onArtistAdd($event) {
    this.artistAdded.emit({event: $event, artistName: this.artistName});
  }

  ngOnInit() { }

}
