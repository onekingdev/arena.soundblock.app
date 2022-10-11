import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Lyrics, Note } from 'src/app/models/collection';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Language } from 'src/app/models/service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {

  @Input() notes: Note[];
  @Input() languages: BehaviorSubject<Language[]>;
  @Output() openAddNote: EventEmitter<any> = new EventEmitter<any>();
  @Output() editted: EventEmitter<any> = new EventEmitter<any>();
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteNote: EventEmitter<Note> = new EventEmitter<Note>();
  public form: FormGroup;
  public isSubmitting: boolean;
  public isSubmitted: boolean;
  public submittedText = '';
  public buttonText: string;
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    if(this.notes.length) {
      this.buttonText = "Delete";
    }
    else {
      this.buttonText = "Add";
    }
    this.form = new FormGroup({
      notes: new FormControl(this.notes.length ? this.notes[0].track_note : '', Validators.required),
      note_uuid: new FormControl(this.notes[0]?.note_uuid),
      language: new FormControl(this.notes.length ? this.notes[0].language_uuid : "A0584462-5430-4D55-87A5-D6778F5D83A9", Validators.required)    })
  }

  addNotes() {
    this.submittedText = 'Notes Added';
    if(this.form.valid) { 
      this.submitted.emit(this.form.value);
    }
  }

  editNote(note: Note) {
    if(this.notes.length) {
      this.buttonText = "Editing";
      this.submittedText = 'Notes Edited';
      this.editted.emit(this.form.value);
    }
  }

  onDeleteNote(note: Note) {
    this.submittedText = 'Notes Deleted';
    this.deleteNote.emit(note);
  }


}
