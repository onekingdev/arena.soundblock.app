import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { CollectionService } from 'src/app/services/project/collection';
import { ProjectService } from 'src/app/services/project/project';
import { SharedService } from 'src/app/services/shared/shared';
import { UploadService } from 'src/app/services/project/upload';
import { CollectionFile } from 'src/app/models/collection';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionService, Permissions } from 'src/app/services/account/permission.service';
import { Project } from 'src/app/models/project';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { fadeOutOnLeaveAnimation } from 'angular-animations';
import { first } from 'rxjs/operators';
import * as JSZip from 'jszip';

interface FileEntry {
  fileName: string;
  fileSize: number;
  dateModified: Date;
  originalFile: File | JSZip.JSZipObject;
  isZip: boolean;
  children?: FileEntry[];
  expanded?: boolean;
}

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  animations: [
    trigger('showOrHide', [
      state('true', style({ opacity: 1, display: 'block' })),
      state('false', style({ opacity: 0, display: 'none' })),
      transition('0 <=> 1', [
        style({ display: 'block' }),
        animate('200ms ease-in-out')
      ])
    ]),
    fadeOutOnLeaveAnimation({ duration: 200 })
  ]
})
export class UploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileList') fileList: ElementRef<HTMLDivElement>;

  private destroy$ = new Subject<void>();
  project: Project;
  curTab = '';
  files: FileEntry[] = [];
  comment = 'Upload Files';
  fileCategory: string;
  fileError: string;
  step: string;
  zipFile: JSZip = new JSZip();;

  errors = [];

  get Permissions() {
    return Permissions;
  }

  filesToUnzip: File[] = [];

  constructor(
    protected dialogRef: NbDialogRef<UploadComponent>,
    private projectService: ProjectService,
    private collectionService: CollectionService,
    public uploadService: UploadService,
    private sharedService: SharedService,
    private permissionService: PermissionService
  ) {
  }

  ngOnInit() {
    this.step = 'upload files'
    this.watchCurrentTab();
    this.watchProjectInfo();
    this.uploadService.files = { music: [], video: [], merch: [], files: [] };
  }

  watchCurrentTab() {
    this.collectionService.watchCurrentTab()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.curTab = res;
      });
  }

  watchProjectInfo() {
    this.projectService.watchProjectInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.project = res;
      });
  }

  movableTo(f: FileEntry, moveDirection: string): boolean {

    const ff: File = f.originalFile as File;

    if (ff.type) {
    }

    return false;
  }

  checkPermission(permission: Permissions): boolean {
    return this.permissionService.checkUserPermission(permission);
  }

  getFileKind(str: string) {
    const index = str.indexOf('.');
    return str.slice(index + 1, str.length).toLowerCase();
  }

  getFileIcon(type: string) {
    return this.sharedService.getFileIcon(type);
  }

  uploadFile() {
    if (!this.files.length || !this.comment) {
      return;
    }

    // TODO: Change uploadFile to fileSSS everywhere
    this.dialogRef.close({
      comment: this.comment,
      uploadFiles: this.files.map(f => f.originalFile)
    });
  }

  processFile(file: File | JSZip.JSZipObject) {
    if (file instanceof File && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
      this.uploadService.isZip = 1;
      this.extractZip(file);
    } else {
      this.uploadService.isZip = 0;
      this.classifyFiles([file]);
    }
  }

  extractZip(file: File) {

    this.zipFile.loadAsync(file).then((zip) => { 

      const zipEntryIndex = this.files.findIndex(fe => fe.originalFile === file);
      const arrFiles = [] as Array<JSZip.JSZipObject>;

      Object.keys(zip.files).forEach((filename) => { 

        const name = this.sharedService.getFileName(this.getFilenameFromFullPath(filename));

        if(!zip.files[filename].dir && name){

          this.files[zipEntryIndex].children.push({
            fileName: zip.files[filename].name,
            fileSize: zip.files[filename]["_data"].compressedSize,
            dateModified: zip.files[filename].date,
            originalFile: zip.files[filename],
            isZip: false
          });

          arrFiles.push(zip.files[filename]);

        }
      });

      this.classifyFiles(arrFiles);

    });
  }

  // Files can be File[] or JSZip.JSZipObject[]
  async classifyFiles(files: any[]) {
    if (!this.uploadService.files) {
      this.uploadService.files = { music: [], video: [], merch: [], files: [] };
    }

    this.errors = [];

    for (const file of files) {
      if (file.name) {
        file.name = file.name;
        file.size = file["_data"].uncompressedSize;
      }

      const filename = this.getFilenameFromFullPath(file.name);
      const extenstion = this.sharedService.getFileExtension(filename);

      const newFile = new CollectionFile();

      newFile.org_file_sortby = file.name;
      newFile.file_name = filename;
      newFile.file_title = this.sharedService.getFileName(filename);
      newFile.file_size = file.size;
      newFile.title_valid = newFile.file_title.length > 0;
      newFile.name_valid = newFile.file_name.length > 0;

      // toLoweCase so files with extension like MP4 gets classified
      switch (extenstion.toLowerCase()) {
        case 'wav':
          if (!this.checkPermission(Permissions.PROJECT_FILE_MUSIC_ADD)) {
            this.errors.push(`You don't have permission to upload Music files`);

            if (files.length === 1) {
              this.files.splice(this.files.indexOf(file), 1);
              // this.file = null;
              return;
            }
          } else {
            newFile.file_category = 'music';
            this.uploadService.files.music.push(newFile);
          }

          break;
        case 'mp4':
          if (!this.checkPermission(Permissions.PROJECT_FILE_VIDEO_ADD)) {
            this.errors.push(`You don't have permission to upload Video files`);

            if (files.length === 1) {
              this.files.splice(this.files.indexOf(file), 1);
              // this.file = null;
              return;
            }
          } else {
            newFile.file_category = 'video';
            newFile.meta = {
              track_uuid: null
            } as any;
            this.uploadService.files.video.push(newFile);
          }

          break;
        case 'zip':

          file.async('blob').then((fileData) => { 
            const zipFile = new File([fileData], filename, {
              type: 'application/x-zip-compressed'
            });

            this.filesToUnzip.push(zipFile);
          });

          break;
        case 'psd':
          if (!this.checkPermission(Permissions.PROJECT_FILE_MERCH_ADD)) {
            this.errors.push(`You don't have permission to upload Merch files`);

            if (files.length === 1) {
              this.files.splice(this.files.indexOf(file), 1);
              // this.file = null;
              return;
            }
          } else {
            newFile.file_category = 'merch';
            this.uploadService.files.merch.push(newFile);
          }

          break;
        default:
          if (!this.checkPermission(Permissions.PROJECT_FILE_OTHER_ADD)) {
            this.errors.push(`You don't have permission to upload other files types`);

            if (files.length === 1) {
              this.files.splice(this.files.indexOf(file), 1);
              // this.file = null;
              return;
            }
          } else {
            newFile.file_category = 'files';
            this.uploadService.files.files.push(newFile);
          }

          break;
      }
    }
    if (this.filesToUnzip.length) {
      this.filesToUnzip.forEach((f, i) => {
        this.extractZip(f);
        this.filesToUnzip.splice(i, 1);
      });
    }
  }

  fileSelected(inputFiles: FileList) {
    this.fileError = '';
    // Convert to normal array
    const files = Array.from(inputFiles);

    const f = files[0];

    files.forEach(file => {
      this.files.push({
        fileName: file.name,
        fileSize: file.size,
        dateModified: new Date(file.lastModified),
        originalFile: file,
        isZip: file.type === 'application/zip' || file.type === 'application/x-zip-compressed',
        children: [],
        expanded: false
      });

      this.processFile(file);
    });
    if (this.files.length > 1 && this.files.find(file => file.isZip)) {
      this.fileError = 'You can upload only one zip file at a time.';
      return;
    }
    setTimeout(() => this.scrollToBottom(), 0);
  }

  removeFile(file: FileEntry, index: number) {
    // Remove local file
    this.files.splice(index, 1);

    // Remove from uploadService
    if (file.isZip) {
      // Remove all zip files
      file.children.forEach(fe => {
        this.removeFileFromUploadService(fe);
      });
    } else {
      // Remove only the file
      this.removeFileFromUploadService(file);
    }
  }

  removeFileFromZip(zipIndex: number, fileIndex: number) {
    // Remove from upload service
    this.removeFileFromUploadService(this.files[fileIndex].children[zipIndex]);

    // Remove from local files
    this.files[fileIndex].children.splice(zipIndex, 1);
    if( this.files[fileIndex].children.length === 0) {
      this.step = 'upload files';
    }
  }

  getFilenameFromFullPath(str: string) {
    const segs = str.split('/');
    return segs[segs.length - 1];
  }

  getFileCategory(file: FileEntry) {
    if (this.uploadService.files.music.find(cf => cf.file_name === this.getFilenameFromFullPath(file.fileName))) {
      this.fileCategory = 'music';
    }

    if (this.uploadService.files.video.find(cf => cf.file_name === this.getFilenameFromFullPath(file.fileName))) {
      this.fileCategory = 'video';
    }

    if (this.uploadService.files.merch.find(cf => cf.file_name === this.getFilenameFromFullPath(file.fileName))) {
      this.fileCategory = 'merch';
    }

    if (this.uploadService.files.files.find(cf => cf.file_name === this.getFilenameFromFullPath(file.fileName))) {
      this.fileCategory = 'files';
    }
    return this.fileCategory;
  }

  changeFileCategory(file: FileEntry, category: 'music' | 'video' | 'merch' | 'files') {
    [
      this.uploadService.files.music,
      this.uploadService.files.video,
      this.uploadService.files.merch,
      this.uploadService.files.files
    ].forEach(fileList => {
      const index = fileList.findIndex(cf => cf.file_name === this.getFilenameFromFullPath(file.fileName));

      if (index !== -1) {
        // Remove and get the file
        const element = fileList.splice(index, 1)[0];

        // Change its category
        element.file_category = category;

        // Push it in the right category
        this.uploadService.files[category].push(element);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  private removeFileFromUploadService(fileEntry: FileEntry) {
    [
      this.uploadService.files.music,
      this.uploadService.files.video,
      this.uploadService.files.merch,
      this.uploadService.files.files
    ].forEach(fileList => {
      const element = fileList.find(cf => cf.file_name === this.getFilenameFromFullPath(fileEntry.fileName));

      if (element) {
        fileList.splice(fileList.indexOf(element), 1);
      }
    });
    if(this.files.length === 0) {
      this.step = 'upload files';
    }
    if (this.files.length > 1 && this.files.find(file => file.isZip)) {
      this.fileError = 'Only one archive file allowed to select.';
    }
    else {
      this.fileError = '';
    }
  }

  private scrollToBottom() {
    try {
      this.fileList.nativeElement.scrollTop = this.fileList.nativeElement.scrollHeight;
    } catch (error) {
      return;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
