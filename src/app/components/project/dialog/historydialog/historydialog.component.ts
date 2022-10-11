import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import { takeUntil } from 'rxjs/operators';
import { Collection, CollectionsResponse } from 'src/app/models/collection';

@Component({
  selector: 'app-historydialog',
  templateUrl: './historydialog.component.html',
  styleUrls: ['./historydialog.component.scss'],
})
export class HistorydialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  projectId: string;
  curColUuid: string;
  collectionsObs: Observable<CollectionsResponse>;
  curCollection: Collection;
  changes: any;

  selColUuid: string;

  constructor(
    private modalController: ModalController,
    public projectService: ProjectService,
    private collectionService: CollectionService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
        this.getProjectCollections(this.projectId);
      });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.curColUuid = queryParams.c;
      this.selColUuid = this.curColUuid;

      this.collectionService.getCollectionHistory(this.curColUuid).subscribe(res => {
        this.changes = res;
      });
    });
  }

  getProjectCollections(projectUuid: string) {
    this.collectionsObs = this.projectService.getCollections(projectUuid, 1, 100);

    this.collectionsObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.curCollection = res.data.data.find(x => x.collection_uuid === this.curColUuid);
      });
  }

  selectVersion() {
    this.close();

    if (this.isRecentCollection(this.curCollection)) { return; }


    this.projectService.changeCollection(this.curCollection.collection_uuid);
  }

  onSelectOption(collection: Collection) {
    this.curCollection = collection;

    this.collectionService.getCollectionHistory(collection.collection_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.changes = res;
      });
  }

  isRecentCollection(collection: Collection) {
    if (this.projectService.collectionUuid.value === collection.collection_uuid) {
      return true;
    }

    return false;
  }

  close() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
