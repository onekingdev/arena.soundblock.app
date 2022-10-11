import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NbDialogRef } from '@nebular/theme';
import { CollectionFile } from 'src/app/models/collection';
import { CollectionService } from 'src/app/services/project/collection';
import { ProjectService } from 'src/app/services/project/project';

@Component({
  selector: 'app-upload-artwork',
  templateUrl: './upload-artwork.component.html',
  styleUrls: [
    './upload-artwork.component.scss',
    '../upload/upload.component.scss'
  ]
})
export class UploadArtworkComponent implements OnInit {
  @Input() track: CollectionFile;

  file: File;
  // comment = '';
  error: string;
  uploadLoading: boolean;

  get imageUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(this.file)
    );
  }

  constructor(
    protected dialogRef: NbDialogRef<UploadArtworkComponent>,
    private sanitizer: DomSanitizer,
    private collectionService: CollectionService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {

  }

  close() {
    this.dialogRef.close();
  }

  fileSelected(file: File) {
    if (file) {
      this.file = file;
    }
  }

  uploadArtwork() {
    this.uploadLoading = true;

    this.collectionService.uploadTrackCover(
      this.projectService.project.value.project_uuid,
      this.track.file_uuid,
      this.file
    ).subscribe(res => {
      this.uploadLoading = false;
      this.dialogRef.close(res.data);
    });
  }
}
