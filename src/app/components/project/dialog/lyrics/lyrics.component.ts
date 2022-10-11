import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CollectionService } from 'src/app/services/project/collection';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Lyrics } from 'src/app/models/collection';
import { Observable, BehaviorSubject } from 'rxjs';
import { Language } from 'src/app/models/service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-lyrics',
  templateUrl: './lyrics.component.html',
  styleUrls: ['./lyrics.component.scss'],
})
export class LyricsComponent implements OnInit, OnChanges {
  @Input() lyrics: Lyrics[];
  @Output() openAddLyrics: EventEmitter<any> = new EventEmitter<any>();
  @Output() openEditLyrics: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteLyrics: EventEmitter<Lyrics> = new EventEmitter<Lyrics>();
  @Input() languages: BehaviorSubject<Language[]>;
  form: FormGroup;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isDeleted: boolean;
  buttonText: string;
  isSubmittedError: any;
  submittedText = '';
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.isSubmitting = false;
    this.form = new FormGroup({
      lyrics: new FormControl(this.lyrics[0]?.track_lyrics, Validators.required),
      lyrics_uuid: new FormControl(this.lyrics[0]?.lyrics_uuid),
      language: new FormControl(this.lyrics.length ? this.lyrics[0].language_uuid : "A0584462-5430-4D55-87A5-D6778F5D83A9", Validators.required)
    })
    if(this.lyrics.length) {
      this.buttonText = 'Delete'
    }
    else {
      this.buttonText = "Add";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  addLyrics() {
    this.submittedText = 'Lyrics Added'
    this.openEditLyrics.emit(this.form.value);
  }

  editLyrics() {
    if (this.lyrics.length) {
      this.submittedText = 'Lyrics Edited'
      this.buttonText = "Editing";
      this.submitted.emit(this.form.value);
      this.isSubmitting = true;
    }
  }

  onDeleteLyrics(lyrics: Lyrics) {
    this.submittedText = 'Lyrics Deleted';
    this.deleteLyrics.emit(lyrics);
  }

}
