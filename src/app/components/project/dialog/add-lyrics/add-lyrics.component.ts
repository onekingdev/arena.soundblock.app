import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Language } from 'src/app/models/service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Lyrics } from 'src/app/models/collection';

@Component({
  selector: 'app-add-lyrics',
  templateUrl: './add-lyrics.component.html',
  styleUrls: ['./add-lyrics.component.scss'],
})
export class AddLyricsComponent implements OnInit {
  @Input() lyrics: Lyrics;
  @Input() languages: BehaviorSubject<Language[]>;
  form: FormGroup;
  isSubmitting: boolean;
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.isSubmitting = false;
    this.form = new FormGroup({
      lyrics: new FormControl(this.lyrics ? this.lyrics.track_lyrics : '', Validators.required),
      language: new FormControl(this.lyrics ? this.lyrics.language_uuid: null, Validators.required)
    })

  }

  onSubmit() {

  }

}