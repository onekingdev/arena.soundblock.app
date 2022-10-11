import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { ProjectService } from 'src/app/services/project/project';
import { CollectionService } from 'src/app/services/project/collection';
import { FileStatus, UploadService } from 'src/app/services/project/upload';
import { Observable, Subject, timer } from 'rxjs';
import { filter, scan, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { CollectionDirectory, CollectionFile } from 'src/app/models/collection';
import {
  fadeOutOnLeaveAnimation,
  fadeInOnEnterAnimation
} from 'angular-animations';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { DeleteConfirmationComponent } from 'src/app/components/common/delete-confirmation/delete-confirmation.component';
import Pusher from 'pusher-js';
import { environment } from '../../../../../../environments/local';
import { Team } from '../../../../../models/team';
import { AuthService } from '../../../../../services/account/auth';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  animations: [
    fadeOutOnLeaveAnimation({ duration: 300 }),
    fadeInOnEnterAnimation({ duration: 300 })
  ]
})
export class SummaryComponent implements OnInit, OnDestroy {
  @ViewChild('uploadProgress') uploadProgressRef: ElementRef<HTMLDivElement>;

  @Input() list: FileStatus;
  @Input() file?: CollectionFile;
  @Input() directory: CollectionDirectory;
  @Input() type?: any;
  @Input() comment?: string;

  private destroy$ = new Subject<void>();

  projectId: string;
  curColUuid: string;
  title = 'Selected Files';
  sections = ['music', 'video', 'merch', 'files'];
  discards: FileStatus;

  minimized = false;
  dragPosition = { x: 0, y: 0 };
  lastDragPosition = { x: 0, y: 0 };
  mousePosition = {
    x: 0,
    y: 0
  };

  job: any;
  initJobTimer: number;
  jobTimer: number;

  constructor(
    protected dialogRef: NbDialogRef<SummaryComponent>,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    public uploadService: UploadService,
    private dialogService: NbDialogService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.curColUuid = queryParams.c;
    });

    this.uploadService.job.pipe(
      filter(job => !!job),
      take(1)
    ).subscribe((job) => {

      if (job.job.flag_status === 'Succeeded') {
        this.uploadService.job.next(null);
        this.close();
        return;
      }

      this.uploadService.job.next(null);

      this.job = job;


      const pusher = new Pusher(environment.pusherApiKey, {
        authEndpoint: `${environment.apiUrl}broadcasting/auth`,
        cluster: environment.pusherCluster,
        forceTLS: true,
        encrypted: true,
        auth: {
          params: {},
          headers: {
            Authorization: `Bearer ${this.authService.accessToken}`
          }
        }
      });

      const channel = pusher.subscribe(`private-channel.app.soundblock.job.${job.job.job_uuid}`);

      this.jobTimer = job.estimate_time;
      this.initJobTimer = job.estimate_time;

      timer(1000, 1000)
        .pipe(
          takeWhile(() => this.jobTimer > 0),
          tap(() => this.jobTimer--)
        )
        .subscribe(() => {

        });

      channel.bind(`Soundblock.Job.${job.job.job_uuid}`, (j: any) => {
        this.job = j;
        this.jobTimer = j.estimate_time;

        if (this.job.job.flag_status === 'Succeeded') {
          this.uploadService.job.next(null);
          this.job = null;
          channel.disconnect();
          this.close();
        }
      });
    });

    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.projectId = project.project_uuid;
      });

    if (this.file) {
      this.list = {
        music: [],
        video: [],
        merch: [],
        files: []
      };

      this.list[this.file.file_category].push(this.file);
    }

    if (this.directory) {
      this.collectionService
        .getDownloadDirectoryInfo(this.curColUuid, this.directory.directory_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.list = {
            music: [],
            video: [],
            merch: [],
            files: []
          };

          const fileCategory = this.directory.directory_path.split('/')[0].toLowerCase();
          this.list[fileCategory].push(...res.data.files);
        });
    }

    if (this.type === 'view') {
      this.title = 'Selected Files';
    }

    if (this.type === 'summary') {
      this.title = 'Summary';
    }

    if (this.type === 'download') {
      this.title = 'Download Files';
    }

    this.discards = this.uploadService.discards;
  }

  close() {
    if (this.uploadService.progress > 0 && this.uploadService.progress < 100) {
      this.dialogService.open(DeleteConfirmationComponent, {
        context: {
          message: 'Are you sure you want to cancel a pending upload?',
          title: 'Cancel Confirmation'
        }
      })
        .onClose
        .subscribe(res => {
          if (res) {
            this.uploadService.progress = null;
            this.uploadService.speed = null;

            this.dialogRef.close();
          }
        });
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * This sets mouse coordinates on mouse down, so we can later checked if the mouse has moved
   */
  setMouseCoords(event: MouseEvent) {
    this.mousePosition.x = event.screenX;
    this.mousePosition.y = event.screenY;
  }

  submit() {
    const files = [
      ...this.list.music,
      ...this.list.video,
      ...this.list.merch,
      ...this.list.files
    ];

    // if (!this.uploadService.isZip) {
    //   if (this.uploadService.reqTemp.path) {
    //     const currentPath = this.uploadService.reqTemp.path;
    //     // File is not a zip so it's only one
    //     files[0].file_path = currentPath;
    //   } else {
    //     // File is uploaded from info tab and we have no temp path
    //     files[0].file_path = files[0].file_category
    //       .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    //   }
    // }

     this.uploadService
      .uploadCollectionFileConfirm(
        null
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (this.uploadService.isZip) {
          this.uploadService.queue = result;
          this.dialogRef.close({ action: 'submit' });
        } else {
          this.projectService.getCollections(this.projectId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(col => {
              this.dialogRef.close({
                collections: col,
                newUuid: result.collection_uuid
              });
            });
        }
      });
  }

  toggleMinimize(event: MouseEvent) {
    // A bit of a hack but we need a way to select the dialog backdrop
    const backdrop = document.getElementsByClassName('summary-backdrop')[0] as HTMLDivElement;

    // Maximize
    if (this.minimized) {
      // Check if the mouse has moved and if so don't trigger a click(maximize)
      if (this.mousePosition.x !== event.screenX || this.mousePosition.y !== event.screenY) {
        event.preventDefault();
        return;
      }

      this.minimized = false;

      // Set backdrop styling to the default one
      backdrop.style.background = 'rgba(0, 0, 0, 0.35)';
      backdrop.style.pointerEvents = 'auto';
    } else {
      this.minimized = true;

      // Set backdrop styling
      backdrop.style.background = 'unset';
      backdrop.style.pointerEvents = 'unset';

      // Restore the position to the last one
      if (this.lastDragPosition) {
        this.dragPosition = this.lastDragPosition;
      }
    }
  }

  onDragEnd(event: CdkDragEnd<HTMLDivElement>) {
    const divElement = event.source.element.nativeElement as HTMLDivElement;

    const position = divElement.getBoundingClientRect();

    this.lastDragPosition.x = position.left - 15;
    this.lastDragPosition.y = position.top - 75;
  }

  download() {
    const files = [
      ...this.list.music,
      ...this.list.video,
      ...this.list.merch,
      ...this.list.files
    ];

    this.collectionService.downloadFiles(this.curColUuid, files)
      .pipe(takeUntil(this.destroy$))
      .subscribe(jobInfo => {
        this.uploadService.queue = jobInfo;
        this.dialogRef.close({
          action: 'download'
        });
      });
  }

  clear() {
    this.list = {
      music: [],
      video: [],
      merch: [],
      files: []
    };
    this.collectionService.clearCheckedList();
    this.dialogRef.close();
  }

  uploadAgain() {

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
