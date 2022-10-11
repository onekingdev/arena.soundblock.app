import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ArtistPublisher, Artist } from 'src/app/models/project';
import { AddArtistPublisherComponent } from 'src/app/components/common/add-artist-publisher/add-artist-publisher.component';
import { takeUntil, tap, map, filter } from 'rxjs/operators';
import { ProfileService } from 'src/app/services/account/profile';
import { DeleteArtistPublisherComponent } from 'src/app/components/common/delete-artist-publisher/delete-artist-publisher.component';

@Component({
  selector: 'app-artist-publishers',
  templateUrl: './artist-publishers.component.html',
  styleUrls: ['./artist-publishers.component.scss'],
})
export class ArtistPublishersComponent implements OnInit {

  @Input() publishers: ArtistPublisher[];
  @Input() accountUuid: string;
  @Input() artists: Artist[];
  @Output() artistPublisherChanged: EventEmitter<ArtistPublisher[]> = new EventEmitter<ArtistPublisher[]>();
  @Output() artistPublisherRemoved: EventEmitter<ArtistPublisher[]> = new EventEmitter<ArtistPublisher[]>();
  constructor(public bsModalRef: BsModalRef,
              private bsModalService: BsModalService,
              private profileService: ProfileService
              ) { }

  ngOnInit() {}

  onAddArtistPublisher() {
    const modalRef = this.bsModalService.show(AddArtistPublisherComponent, {
      initialState: {
        artists: this.artists,
        accountUuid: this.accountUuid
      }
    });


    modalRef.content.artistPublisherAddedConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }),
        map((artist) => artist))
      .subscribe((artist) => {
        modalRef.content.artistPublisherAdding = true;
        this.profileService.addArtistPublisher(
          { account: this.accountUuid, artist: artist.artist,publisher_name: artist.publisher_name }).subscribe(res => {
          if (res) {
            modalRef.content.artistPublisherAdding = false;
            modalRef.content.artistPublisherAdded = true;
            this.publishers = [...this.publishers, res.data]
            this.artistPublisherChanged.emit(this.publishers);
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistPublisherAdding = false;
          modalRef.content.artistPublisherAddedError = err;
        })
      });

    return modalRef.onHidden;
  }
  onDeletepublishers(publisher) {
    const modalRef = this.bsModalService.show(DeleteArtistPublisherComponent, {
    });

    modalRef.content.artistPublisherRemovedError = null;

    modalRef.content.artistPublisherRemoveConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }),
        filter((confirmed: boolean) => confirmed))
      .subscribe((res) => {
        this.profileService.deleteArtistPublisher({ account: this.accountUuid, publisher: publisher.publisher_uuid }).subscribe(res => {
          if (res) {
            this.publishers = this.publishers.filter(artist => artist.publisher_uuid !== publisher.publisher_uuid)
            this.artistPublisherRemoved.emit(this.publishers);
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistPublisherRemovedError = err;
        })
      });

    return modalRef.onHidden;
  }

}
