import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Lyrics } from 'src/app/models/collection';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { observable, Observable } from 'rxjs';

@Component({
  selector: 'app-delete-lyrics',
  templateUrl: './delete-lyrics.component.html',
  styleUrls: ['./delete-lyrics.component.scss'],
})
export class DeleteLyricsComponent implements OnInit {
  @Input() isDeleting: boolean;
  @Input() isDeleted: boolean;
  @Input() isDeletedError: any;
  @Input() lyrics: Observable<Lyrics>;
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {}

  onDeleteLyrics() {
    this.deleted.emit();
  }

}
