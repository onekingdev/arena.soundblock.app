import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Contributor } from 'src/app/models/collection';
import { ContributorType } from 'src/app/models/service';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-track-contributor',
  templateUrl: './track-contributor.component.html',
  styleUrls: ['./track-contributor.component.scss'],
})
export class TrackContributorComponent implements OnInit {
  @Input() contributors: Contributor[];
  @Input() contributorTypes: Observable<ContributorType[]>;
  @Output() addContributor: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteContributors: EventEmitter<Contributor> = new EventEmitter<Contributor>();
  form: FormGroup;
  isAdding: boolean;
  isAdded: boolean;
  addError: any;
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.form = new FormGroup({
      type: new FormControl(null, Validators.required),
      contributor: new FormControl(null, Validators.required)
    })
  }

  addContributors() {
    this.addContributor.emit(this.form.value);
  }

  onDeleteContributor(contributor) {
    this.deleteContributors.emit(contributor);
  }

}
