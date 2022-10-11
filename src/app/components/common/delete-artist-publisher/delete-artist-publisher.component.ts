import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-delete-artist-publisher',
  templateUrl: './delete-artist-publisher.component.html',
  styleUrls: ['./delete-artist-publisher.component.scss'],
})
export class DeleteArtistPublisherComponent implements OnInit {
  @Input() public artistPublisherRemoved: boolean;
  @Input() public artistPublisherRemoving: boolean;
  @Input() public artistPublisherRemovedError: any;

  @Output() artistPublisherRemoveConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit(): void {
  }

  confirm() {
    this.artistPublisherRemoveConfirmed.emit(true);
  }

}
