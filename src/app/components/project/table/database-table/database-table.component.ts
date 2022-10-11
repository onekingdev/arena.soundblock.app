import { Component, OnInit } from '@angular/core';
import { ProjectTab, DatabaseTab, ArtistPublisher } from 'src/app/models/project';
import { Subject } from 'rxjs';
import { BreadcrumbItem } from 'src/app/models/breadcrumbItem';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import { BreadcrumbService } from 'src/app/services/project/breadcrumb';
import { SharedService } from 'src/app/services/shared/shared';
import { Artist, ProjectArtist } from 'src/app/models/project';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProfileService } from 'src/app/services/account/profile';
import { AddArtistComponent } from 'src/app/components/common/add-artist/add-artist.component';
import { tap, map, filter, takeUntil } from 'rxjs/operators';
import { DeleteArtistComponent } from 'src/app/components/common/delete-artist/delete-artist.component';
import { DeleteArtistPublisherComponent } from 'src/app/components/common/delete-artist-publisher/delete-artist-publisher.component';
import { AddArtistPublisherComponent } from 'src/app/components/common/add-artist-publisher/add-artist-publisher.component';
@Component({
  selector: 'app-database-table',
  templateUrl: './database-table.component.html',
  styleUrls: ['./database-table.component.scss'],
})
export class DatabaseTableComponent implements OnInit {
  public accountUuid: string;
  public projectUuid: string;
  private destroy$ = new Subject<void>();
  private artistRemovedError: any;
  private artistPublisherRemoveError: any;
  public artists: Artist[];
  public artistPublishers: ArtistPublisher[];
  breadcrumb: BreadcrumbItem[] = [];
  currentTab: ProjectTab;
  currentDatabaseTab: DatabaseTab;
  curColUuid: string;
  artistLoading = false;
  artistPublisherLoading = false;
  artistSaving = [];
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    private breadcrumbService: BreadcrumbService,
    private sharedService: SharedService,
    public bsModalRef: BsModalRef,
    private bsModalService: BsModalService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.projectService.watchProjectInfo()
    .pipe(takeUntil(this.destroy$))
    .subscribe(project => { 
      if(project?.account) {
        this.accountUuid = project?.account?.account_uuid;
        this.projectUuid = project?.project_uuid;
        this.getAccountArtists();
      }
    });

    this.watchBreadcrumb();
    this.watchCurrentDatabaseTab();
  }

  get ProjectTab() {
    return ProjectTab;
  }
  get DatabaseTab() {
    return DatabaseTab;
  }
  watchBreadcrumb() {
    this.breadcrumbService.getBreadcrumb()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.breadcrumb = res;
      });
  }
  watchCurrentDatabaseTab() {
    this.collectionService
      .watchCurrentDatabaseTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        if (!tab) {
          this.currentDatabaseTab = DatabaseTab.ARTIST;
          return;
        }
        if (tab === DatabaseTab.ARTIST) {
          this.getAccountArtists();
        }
        else {
          this.getAccountArtistPublishers();
        }
        this.currentDatabaseTab = tab;
      });
  }
  onClickBreadcrumb(index: number) {
    this.breadcrumbService.sliceBreadcrumb(index + 1);

    let param = '';

    this.breadcrumb.forEach(element => {
      param += `/${element.name}`;
    });

    this.router.navigate([], {
      queryParams: {
        version: this.sharedService.getQueryParameter('version'),
        path: param
      }
    });

    this.collectionService.updateDataWithBreadcrumb(this.breadcrumb, this.curColUuid);
  }
  getAccountArtists() {
    this.artistLoading = true;
    this.projectService.getServicePlanArtists(this.accountUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.artists = res?.data?.sort((a, b) => {
          const nameA = a.artist_name.toUpperCase(); // ignore upper and lowercase
          const nameB = b.artist_name.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          };})
        this.artistLoading = false;
      })
  }
  getAccountArtistPublishers() {
    this.artistPublisherLoading = true;
    this.projectService.getAccountPlanArtistPublishers(this.accountUuid).pipe(takeUntil(this.destroy$)).subscribe
      (response => {
       this.artistPublishers = response.data;
        this.artistPublisherLoading = false;
      })
  }
  onAddArtist() {
    const modalRef = this.bsModalService.show(AddArtistComponent, {
      class: 'modal-dialog-centered modal-lg',
      ignoreBackdropClick: true
    });
    modalRef.content.artistAddedConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }))
      .subscribe((artist) => {
        modalRef.content.artistAdding = true;
        this.profileService.addArtist({account: this.accountUuid,...artist}).subscribe((res) => {
          if (res) {
            this.artists = [...this.artists, new Artist().deserialize(res.data)];
            modalRef.content.artistAdding = false;
            modalRef.content.artistAdded = true;
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistAddedError = err;
          modalRef.content.artistAdding = false;
        })
      });

    return modalRef.onHidden;
  }
  onAddArtistPublisher() {
    this.getAccountArtists();
    const modalRef = this.bsModalService.show(AddArtistPublisherComponent, {
      initialState: {artists: this.artists}
    });

    modalRef.content.artistPublisherAddedConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }),
        map((artist) => artist))
      .subscribe((artist) => {
        modalRef.content.artistPublisherAdding = true;
        this.profileService.addArtistPublisher(
          { account: this.projectUuid, artist: artist.artist,publisher_name: artist.publisher_name }).subscribe(res => {
          if (res) {
            this.artistPublishers = [...this.artistPublishers, new ArtistPublisher().deserialize(res.data)];
            modalRef.content.artistPublisherAdding = false;
            modalRef.content.artistPublisherAdded = true;
            modalRef.hide();
          }
        }, err => {
          modalRef.content.artistPublisherAdding = false;
          modalRef.content.artistPublisherAddedError = err;
        })
      });

    return modalRef.onHidden;
  }
  onDeleteArtist(artistUUID) {
    this.artistRemovedError = null;
    const modalRef = this.bsModalService.show(DeleteArtistComponent, {
    });

    modalRef.content.artistRemovedError = this.artistRemovedError;

    modalRef.content.artistRemoveConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }),
        filter((confirmed: boolean) => confirmed))
      .subscribe((_) => {
        this.profileService.deleteArtist({ account: this.accountUuid, artist: artistUUID }).subscribe(res => {
          if (res) {
            this.artists = this.artists.filter(artist => artist.artist_uuid !== artistUUID)
            modalRef.hide();
          }
        }, err => {
          this.artistRemovedError = err;
        })
      });

    return modalRef.onHidden;
  }

  onDeleteArtistPublisher(artistUUID) {
    this.artistPublisherRemoveError = null;
    const modalRef = this.bsModalService.show(DeleteArtistPublisherComponent, {
    });

    modalRef.content.artistPublisherRemovedError = this.artistRemovedError;

    modalRef.content.artistPublisherRemoveConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }),
        filter((confirmed: boolean) => confirmed))
      .subscribe((_) => {
        this.profileService.deleteArtistPublisher({ account: this.accountUuid, publisher: artistUUID }).subscribe(res => {
          if (res) {
            this.artistPublishers = this.artistPublishers.filter(artist => artist.artist_uuid !== artistUUID)
            modalRef.hide();
          }
        }, err => {
          this.artistPublisherRemoveError = err;
        })
      });

    return modalRef.onHidden;
  }


  onEditArtist(artist: Artist, index) {
    const modalRef = this.bsModalService.show(AddArtistComponent, {
      class: 'modal-dialog-centered modal-lg',
      ignoreBackdropClick: true,
      initialState: {artist}
    });
    modalRef.content.artistEditConfirmed
      .pipe(
        takeUntil(modalRef.onHidden),
        tap(() => { }))
      .subscribe((artistVal) => {
        modalRef.content.artistAdding = true;
        this.profileService.editArtist({
          ...artistVal,
          artist: artist.artist_uuid, account: this.accountUuid
        }).subscribe(res => {
          this.artists = 
          this.artists.map(artistVal => artistVal.artist_uuid === artist.artist_uuid ? artist : artistVal);
          modalRef.content.artistAdding = false;
          modalRef.content.artistAdded = true;
          modalRef.hide();
        },
        err => {
          modalRef.content.artistAddedError = err;
          modalRef.content.artistAdding = false;
        }
        );
      });

    return modalRef.onHidden;
  }
  onEditArtistPublisher(artist: ArtistPublisher, index) {
    this.artistSaving[index] = true;
    this.profileService.editArtistPublisher({
      publisher_name: artist.publisher_name,
      publisher: artist.publisher_uuid, account: this.accountUuid
    }).subscribe(res => {
      this.artistPublishers = 
      this.artistPublishers.map(artistVal => artistVal.artist_uuid === artist.artist_uuid ? artist : artistVal);
      artist.editable = false;
      this.artistSaving[index]= false;
    });

  }
  setCurrentDatabaseTab(tab: DatabaseTab) {
    this.collectionService.setCurrentDatabaseTab(tab);
  }

}
