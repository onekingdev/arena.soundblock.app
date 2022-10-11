import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-delete-artist',
  templateUrl: './delete-artist.component.html',
  styleUrls: ['./delete-artist.component.scss'],
})
export class DeleteArtistComponent implements OnInit {

  @Input() public artistRemoved: boolean;
  @Input() public artistRemoving: boolean;
  @Input() public artistRemovedError: any;

  @Output() artistRemoveConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit(): void {
  }

  confirm() {
    this.artistRemoveConfirmed.emit(true);
  }

}
