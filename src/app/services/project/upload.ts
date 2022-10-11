import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { map, catchError, switchMap, filter } from 'rxjs/operators';
import { ProjectTab } from 'src/app/models/project';
import { CollectionFile, ConfirmRequest, DownloadInfo } from 'src/app/models/collection';

export interface FileStatus {
  music: CollectionFile[];
  video: CollectionFile[];
  merch: CollectionFile[];
  files: CollectionFile[];
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  // Manage Uploading Files
  files: FileStatus;
  steps: ProjectTab[] = [];
  stepIndex = 0;
  changes: FileStatus;
  discards: FileStatus;
  isZip = 0;

  public isSaved: Subject<boolean> = new BehaviorSubject(false);
  public job: Subject<any> = new BehaviorSubject(null);

  // Upload Zip
  uploadSub: Subscription;
  progress: number;
  uploadFailed: boolean;
  fileName: any;

  queue: DownloadInfo;

  // Speed in kb/s
  speed: string;
  lastNow: number;
  lastKBytes: number;

  constructor(
    private http: HttpClient
  ) {
    this.initUploadStatus();
  }

  initUploadStatus() {
    this.progress = 0;
    this.uploadFailed = false;
  }

  initFilesStatus() {
    this.changes = {
      music: [],
      video: [],
      merch: [],
      files: []
    };

    this.discards = {
      music: [],
      video: [],
      merch: [],
      files: []
    };

    this.steps = [];
    this.files = { music: [], video: [], merch: [], files: [] };
  }

  setSteps(curTab) {
    this.steps = [];
    if (this.files.video.length > 0) {
      this.steps.push(ProjectTab.VIDEO);
    }

    if (this.files.merch.length > 0) {
      this.steps.push(ProjectTab.MERCH);
    }

    if (this.files.files.length > 0) {
      this.steps.push(ProjectTab.FILES);
    }

    const index = this.steps.findIndex(x => x === curTab);

    if (index !== -1) {
      [this.steps[0], this.steps[index]] = [this.steps[index], this.steps[0]];
    }
    if (this.files.music.length > 0) {
      this.steps.unshift(ProjectTab.MUSIC);
    }
    this.stepIndex = 1;
  }

  doneCurStep() {
    // this.steps.shift();
    // this.stepIndex++;
    this.steps = [];
  }

  get curStep() {
    return this.steps[0];
  }

  get filesArr() {
    return [
      ...this.files.music,
      ...this.files.video,
      ...this.files.merch,
      ...this.files.files
    ];
  }

  uploadCollectionFile(project: string, comment: string, files: File[], path: string, tab: ProjectTab) {
    const formData = new FormData();

    formData.append('project', project);
    files.forEach(file => {
      formData.append('files[]', file);
    });
    formData.append('collection_comment', comment);
    formData.append('file_path', path ==='tracks'?'Music':path);
    formData.append('file_category', tab==='tracks'?'Music':tab);

    this.initUploadStatus();

    this.lastNow = new Date().getTime();
    this.lastKBytes = 0;

    return this.http.post<any>(`soundblock/project/collection/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:

            const now = new Date().getTime();
            const bytes = event.loaded;
            const total = event.total;
            const percent = bytes / total * 100;
            const kbytes = bytes / 1024;
            const mbytes = kbytes / 1024;
            const uploadedkBytes = kbytes - this.lastKBytes;
            const elapsed = (now - this.lastNow) / 1000;
            const kbps = elapsed ? uploadedkBytes / elapsed : 0;
            this.lastKBytes = kbytes;
            this.lastNow = now;

            let su = 'kb/s';
            let speed = kbytes;
            if (kbytes > 1024) {
              su = 'mb/s';
              speed = mbytes;
            }

            this.progress = +percent.toFixed(1);
            this.speed = `${speed.toFixed(1)} ${su}`;

            break;
          case HttpEventType.Response:
            return event.body;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.uploadFailed = true;
        return throwError(error);
      })
    );
  }

  uploadCollectionFileConfirm(req) {
    return this.http.post<any>(`soundblock/project/collection/upload/confirm`, req).pipe(map(res => {
      return res.data;
    }));
  }

  downloadFileFromUrl(url: string) {
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  getJobStatus(jobUuid: string) {
    return this.http.get<any>(`core/job/${jobUuid}/status`).pipe(map(res => {
      return res.data;
    }));
  }

  setJobSilentAlert(jobUuid: string, isSilent: boolean) {
    const req = {
      job: jobUuid,
      flag_silentalert: isSilent ? 1 : 0
    };
    return this.http.patch<any>(`core/job`, req);
  }
}
