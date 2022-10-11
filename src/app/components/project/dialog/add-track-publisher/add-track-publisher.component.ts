import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ArtistPublisher } from 'src/app/models/project';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-track-publisher',
  templateUrl: './add-track-publisher.component.html',
  styleUrls: ['./add-track-publisher.component.scss'],
})
export class AddTrackPublisherComponent implements OnInit {
  @Input() publishers:ArtistPublisher[]
  form: FormGroup;
  isSubmitting: boolean;
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.isSubmitting = false;
    this.form = new FormGroup({
      publisher: new FormControl(null, Validators.required),
    })

  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.isSubmitting = true;
    }
  }
}
