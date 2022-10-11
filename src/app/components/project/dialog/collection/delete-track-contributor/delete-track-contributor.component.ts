import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-delete-track-contributor',
  templateUrl: './delete-track-contributor.component.html',
  styleUrls: ['./delete-track-contributor.component.scss'],
})
export class DeleteTrackContributorComponent implements OnInit {
  @Input() public trackContributorRemoved: boolean;
  @Input() public trackContributorRemoving: boolean;
  @Input() public trackContributorRemovedError: any;

  @Output() trackContributorRemoveConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public bsModalRef: BsModalRef) {
  }

  ngOnInit(): void {
  }

  confirm() {
    this.trackContributorRemoveConfirmed.emit(true);
  }

}
