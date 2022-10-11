import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project/project';
import { takeUntil } from 'rxjs/operators';
import { ArtistPublisher, Artist } from 'src/app/models/project';
import { Subject } from 'rxjs';
import { AddArtistPublisherRequest } from 'src/app/models/service';
@Component({
  selector: 'app-add-artist-publisher',
  templateUrl: './add-artist-publisher.component.html',
  styleUrls: ['./add-artist-publisher.component.scss'],
})
export class AddArtistPublisherComponent implements OnInit {

  @Input() public artistPublisherAddedError: any;
  @Input() public accountUuid: string;
  @Input() public artists: Artist[];
  @Input() public artistPublisherAdding: boolean;
  @Input() public artistPublisherAdded: boolean;
  @Output() artistPublisherAddedConfirmed: EventEmitter<AddArtistPublisherRequest> = new EventEmitter<AddArtistPublisherRequest>();

  public form: FormGroup;
  artistPublishers: ArtistPublisher[];
  private destroy$ = new Subject<void>();
  constructor(
    public bsModalRef: BsModalRef,
    private projectService: ProjectService,

    ) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      artist: new FormControl([], Validators.required),
      publisher_name: new FormControl('',Validators.required),
    })
  }
  getAccountArtistPublishers(){
    this.projectService.getAccountPlanArtistPublishers(this.accountUuid).pipe(takeUntil(this.destroy$)).subscribe
    (response=>{
      this.artistPublishers = response.data;
    })
  }

  confirm() {
    if(this.form.valid) {
      this.artistPublisherAddedConfirmed.emit(this.form.value);
    }
  }
  
}
