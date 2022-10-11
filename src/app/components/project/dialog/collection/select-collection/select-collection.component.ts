import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project/project';
import { Collection } from 'src/app/models/collection';
import { NbDialogRef } from '@nebular/theme';
import { first } from 'rxjs/operators';
import { CollectionService } from 'src/app/services/project/collection';
import { PlatformCategory } from 'src/app/pages/projects/deployments/deployments.page';

@Component({
  selector: 'app-select-collection',
  templateUrl: './select-collection.component.html',
  styleUrls: ['./select-collection.component.scss'],
})
export class SelectCollectionComponent implements OnInit {
  // From Context
  projectUUID: string;
  platformCategory: PlatformCategory;

  collections: Collection[] = [];
  collectionHistory: any[];

  currentPage = 1;
  totalCollections: number;

  selectedCollection: Collection;

  constructor(
    private projectService: ProjectService,
    private collectionService: CollectionService,
    protected dialogRef: NbDialogRef<SelectCollectionComponent>
  ) { }

  ngOnInit() {
    this._getCollections();
  }

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(this.selectedCollection);
  }

  async loadNextPage(event: any) {
    if (this.collections.length < this.totalCollections) {
      this.currentPage++;

      await this._getCollections();

      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }

  async selectCollection(collection: Collection) {
    if (collection === this.selectedCollection) { return; }
    // Show the loading indicator
    this.collectionHistory = null;

    this.selectedCollection = collection;

    const res = await this.collectionService
      .getCollectionHistory(collection.collection_uuid)
      .pipe(first())
      .toPromise();

    this.collectionHistory = res;
  }

  private async _getCollections() {
    const res = await this.projectService
      .getCollections(this.projectUUID, this.currentPage, 8, this.platformCategory.toLowerCase())
      .pipe(first())
      .toPromise();

    if (!this.totalCollections) {
      this.totalCollections = res.data.total;
    }

    // There are no collection for the selected platform category so close and display an error
    if (!res.data.data.length) {
      this.dialogRef.close(null);
    }

    if (!this.selectedCollection) {
      this.selectCollection(res.data[0]);
    }

    this.collections.push(...res.data.data);
  }
}
