import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ArtistPublisher } from 'src/app/models/project';

@Component({
  selector: 'app-track-artist-publishers',
  templateUrl: './track-artist-publishers.component.html',
  styleUrls: ['./track-artist-publishers.component.scss'],
})
export class TrackArtistPublishersComponent implements OnInit {
  @Input() publishers: ArtistPublisher[];
  @Output() openAddpublishers: EventEmitter<any> = new EventEmitter<any>();
  @Output() openEditpublishers: EventEmitter<ArtistPublisher> = new EventEmitter<ArtistPublisher>();
  @Output() deletepublishers: EventEmitter<ArtistPublisher> = new EventEmitter<ArtistPublisher>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }
  addpublishers() {
    this.openAddpublishers.emit();
  }

  editpublishers(publishers: ArtistPublisher) {
    this.openEditpublishers.emit(publishers);
  }

  onDeletepublishers(publishers: ArtistPublisher) {
    this.deletepublishers.emit(publishers);
  }

}
