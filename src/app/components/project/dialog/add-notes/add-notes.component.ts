import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Note } from 'src/app/models/collection';
import { Language } from 'src/app/models/service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.scss'],
})
export class AddNotesComponent implements OnInit {
  @Input() notes: Note;
  @Input() languages: BehaviorSubject<Language[]>;
  form: FormGroup;
  isSubmitting: boolean;
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.isSubmitting = false;
    this.form = new FormGroup({
      notes: new FormControl(this.notes ? this.notes.track_note : '', Validators.required),
      language: new FormControl(this.notes ? this.notes.language_uuid: null, Validators.required)
    })

  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.isSubmitting = true;
    }
  }

}
