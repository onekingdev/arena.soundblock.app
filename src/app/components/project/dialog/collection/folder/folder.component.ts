import { Component, OnInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonTextarea } from '@ionic/angular';
import { NbDialogRef } from '@nebular/theme';
import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';

import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectTab } from 'src/app/models/project';
@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
})
export class FolderComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInput: IonTextarea;
  @ViewChild('folderNameInput') folderNameInput: ElementRef;

  @Input() action: string;
  @Input() category: ProjectTab;
  @Input() folder?: any;

  private destroy$ = new Subject<void>();

  projectId: string;
  folderName: any;
  comment: any;
  currentTab: ProjectTab;

  constructor(
    protected dialogRef: NbDialogRef<any>,
    private projectService: ProjectService,
    private collectionService: CollectionService,
  ) { }

  ngOnInit() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
      });

    this.collectionService.watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.currentTab = res;
      });

    if (this.folder) {
      this.folderName = this.folder.directory_name;
    }
  }

  submit() {
    if (!this.folderName) {
      this.folderNameInput.nativeElement.focus();
      return;
    }

    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }

    const path = this.capitalize(this.collectionService.currentPath);

    this.collectionService.addFolder(
      this.capitalize(this.currentTab),
      this.projectId,
      this.comment,
      this.folderName,
      path
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(collections => {
        const newUuid = collections.data.data[0].collection_uuid;
        this.projectService.collectionAdded$.next(collections.data.data[0]);
        this.projectService.collectionUuid.next(newUuid);
        this.dialogRef.close({ newUuid });
      });
  }

  capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1);
  }

  edit() {
    if (!this.folderName) {
      this.folderNameInput.nativeElement.focus();
      return;
    }

    if (!this.comment) {
      this.commentInput.setFocus();
      return;
    }

    const path = this.capitalize(this.collectionService.currentPath);

    this.collectionService.editFolder(
      this.currentTab,
      this.projectId,
      this.comment,
      this.folder.directory_name,
      this.folderName,
      path
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(collections => {
        const newUuid = collections.data.data[0].collection_uuid;
        this.projectService.collectionAdded$.next(collections.data[0]);
        this.projectService.collectionUuid.next(newUuid);
        this.dialogRef.close({ newUuid });
      });
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
