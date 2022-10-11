import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Note } from 'src/app/models/collection';

@Component({
  selector: 'app-delete-notes',
  templateUrl: './delete-notes.component.html',
  styleUrls: ['./delete-notes.component.scss'],
})
export class DeleteNotesComponent implements OnInit {
  @Input() isDeleting: boolean;
  @Input() isDeleted: boolean;
  @Input() isDeletedError: any;
  @Input() notes: Note;
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {}

  onDeleteNotes() {
    this.deleted.emit();
  }
}
