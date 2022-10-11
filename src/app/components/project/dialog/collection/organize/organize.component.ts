import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { NbDialogRef } from '@nebular/theme';

import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectTab, ProjectTrack } from 'src/app/models/project';

@Component({
  selector: 'app-organize',
  templateUrl: './organize.component.html',
  styleUrls: ['./organize.component.scss'],
})
export class OrganizeComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput: IonTextarea;
  private destroy$ = new Subject<void>();

  projectUUID: any;
  tracks: ProjectTrack[];
  comment: any;

  tracksLoading: boolean;

  constructor(
    protected dialogRef: NbDialogRef<any>,
    private projectService: ProjectService,
    private collectionService: CollectionService,
  ) { }

  ngOnInit() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectUUID = project.project_uuid;
        this.getProject();
      });
  }

  doReorder(ev: any) {
    this.tracks = ev.detail.complete(this.tracks);
  }

  submit() {
    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }
    this.updateMusicTracks();
    
    this.collectionService.organizeMusic(
      ProjectTab.MUSIC,
      this.projectUUID,
      this.comment,
      this.tracks,
      // The latest collection UUID
      this.projectService.collectionUuid.value,
      1
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(collections => {
        const newUuid = collections[0].collection_uuid;
        this.projectService.collectionAdded$.next(collections[0]);
        this.projectService.collectionUuid.next(newUuid);
        this.dialogRef.close({ newUuid });
      });
  }

  updateMusicTracks() {
    for (let i = 0; i < this.tracks.length; i++) {
      this.tracks[i].meta.file_track = i + 1;
    }
  }

  close() {
    this.dialogRef.close();
  }

  private getProject() {
    this.tracksLoading = true;
    // TODO: add loading
    this.projectService
      .getProjectByID(this.projectUUID)
      .subscribe(project => {
        this.tracks = _.cloneDeep(project.tracks);
        this.tracksLoading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
