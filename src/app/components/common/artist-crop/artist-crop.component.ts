import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CropperComponent } from 'angular-cropperjs';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-artist-crop',
  templateUrl: './artist-crop.component.html',
  styleUrls: ['./artist-crop.component.scss'],
})
export class ArtistCropComponent implements OnInit {

  @Input() public dest_dimensions: any;
  @Output() imageCropped: EventEmitter<any> = new EventEmitter<any>();

  imageSource = null;
  imageDestination = null;
  tab = 1;

  @ViewChild('angularCropper') public angularCropper: CropperComponent;
  
  config = {
    aspectRatio : 4 / 4,
    dragMode : 'move',
    background : true,
    movable: true,
    rotatable : true,
    scalable: true,
    zoomable: true, 
    viewMode: 1,
    checkImageOrigin : true,
    crop:this.cropApplied.bind(this),
    checkCrossOrigin: true
  }

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  fileSelected(event) {
    if (event && event[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
          this.imageSource = event.target.result;
      }
      reader.readAsDataURL(event[0]);
    }
  }

  applyUpload() {
    this.compressImage(this.imageDestination, 1400, 1400).then((base64TrimmedURL: string) => {
      this.createBlobImageFileAndShow(base64TrimmedURL);
    });
  }

  compressImage(src, newX, newY) {
    return new Promise((success, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, newX, newY);
        const data: string = ctx.canvas.toDataURL();
        // this.base64DefaultURL = data;
        success(data.replace(/^data:image\/(png|jpg);base64,/, ""));
      }
      img.onerror = error => reject(error);
    })
  }

  createBlobImageFileAndShow(base64TrimmedURL): void {
    this.dataURItoBlob(base64TrimmedURL).subscribe((blob: Blob) => {
      const imageBlob: Blob = blob;
      const imageName: string = this.generateName();
      const imageFile: File = new File([imageBlob], imageName, {
        type: "image/jpeg"
      });
      this.imageCropped.emit(imageFile);
    });
  }
  
    /* Method to convert Base64Data Url as Image Blob */
  dataURItoBlob(dataURI: string): Observable<Blob> {
    return Observable.create((observer: Observer<Blob>) => {
      const byteString: string = window.atob(dataURI);
      const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length);
      const int8Array: Uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([int8Array], { type: "image/jpeg" });
      observer.next(blob);
      observer.complete();
    });
  }

  /**Method to Generate a Name for the Image */
  generateName(): string {
    const date: number = new Date().valueOf();
    let text: string = "";
    const possibleText: string =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(
        Math.floor(Math.random() * possibleText.length)
      );
    }
    // Replace extension according to your media type like this
    return date + "." + text + ".jpeg";
  }

  cropApplied(data){
    this.imageDestination = this.angularCropper.cropper.getCroppedCanvas().toDataURL();
  }

  resetUploadPhoto() {
    this.imageSource = null;
  }

  ngOnInit() {}
}
