import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  @Input() placeholder: string;
  @Input() imagesOnly = false;
  @Input() multiple = false;
  @Output() fileSelected = new EventEmitter<File | FileList>();

  uploadFile(files: FileList) {
    const file = files[0];
    this.fileSelected.emit(this.multiple ? files : file);
  }
}
