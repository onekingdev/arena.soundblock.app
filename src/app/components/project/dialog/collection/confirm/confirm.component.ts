import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonTextarea } from '@ionic/angular';
import { NbDialogRef } from '@nebular/theme';

import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CollectionDirectory, CollectionFile, CollectionsResponse } from 'src/app/models/collection';
import { ProjectTab } from 'src/app/models/project';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})

export class ConfirmComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput: IonTextarea;

  @Input() action: 'Revert' | 'Delete' | 'Edit' | 'Restore';
  @Input() category: ProjectTab;
  @Input() itemType: any;
  @Input() files?: CollectionFile[];
  @Input() folder?: CollectionDirectory;

  private destroy$ = new Subject<void>();

  projectId: string;
  curColUuid: string;
  currentTab: ProjectTab;
  comment: string;

  constructor(
    protected dialogRef: NbDialogRef<any>,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private collectionService: CollectionService,
  ) { }

  ngOnInit() {
    this.collectionService.watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.currentTab = res;
      });

    this.watchRouterParams();
  }

  watchRouterParams() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.curColUuid = queryParams.c;
    });

    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
      });
  }

  delete() {
    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }

    if (this.itemType === 'File') {
      this.collectionService.deleteFiles(
        this.currentTab,
        this.projectId,
        this.comment,
        this.files
      ).subscribe(collections => {
        this.closeWithUpdateCollections(collections);
      });
    } else if (this.itemType === 'Folder') {
      this.collectionService.deleteFolder(
        this.currentTab,
        this.projectId,
        this.comment,
        this.folder.directory_uuid
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.closeWithUpdateCollections(collections);
        });
    }
  }

  revert() {
    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }
    if (this.itemType === 'File') {
      this.collectionService.revertFile(
        this.currentTab,
        this.curColUuid,
        this.comment,
        this.files
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.closeWithUpdateCollections(collections);
        });
    } else if (this.itemType === 'Folder') {
      this.collectionService.revertFolder(
        this.currentTab,
        this.curColUuid,
        this.comment,
        this.folder.directory_uuid
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.closeWithUpdateCollections(collections);
        });
    }
  }

  restore() {
    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }
    if (this.itemType === 'File') {
      this.collectionService.restoreFile(
        this.currentTab,
        this.curColUuid,
        this.comment,
        this.files
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.closeWithUpdateCollections(collections);
        });
    } else if (this.itemType === 'Folder') {
      this.collectionService.restoreFolder(
        this.currentTab,
        this.curColUuid,
        this.comment,
        this.folder.directory_uuid
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe(collections => {
          this.closeWithUpdateCollections(collections);
        });
    }
  }

  getDialogTitle() {
    let title = '';
    title = `${this.action} ${this.category}`;
    if (this.action !== 'Delete' || (this.files.length === 1 && this.files)) {
      // title += this.itemType === 'Folder' ? ` Folder(${this.folder.directory_name})` : ` File(${this.files[0].file_name})`;
      title += this.itemType === 'Folder' ? ` Folder(${this.folder.directory_name})` : ``;
    }
    return title;
  }

  closeWithUpdateCollections(collections: CollectionsResponse) {
    const newUuid = collections.data.data[0].collection_uuid;
    this.projectService.collectionAdded$.next(collections.data.data[0]);
    this.projectService.collectionUuid.next(newUuid);
    this.dialogRef.close({ newUuid });
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
