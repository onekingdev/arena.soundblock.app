import {
  Directive,
  Output,
  Input,
  EventEmitter,
  HostBinding,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onFileDropped = new EventEmitter<any>();

  @HostBinding('style.background-color') background = '#f5fcff';
  @HostBinding('style.opacity') opacity = '1';

  // Dragover listener
  @HostListener('dragover', ['$event']) dragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '0.6';
  }
  // Dragleave listener
  @HostListener('dragleave', ['$event']) public dragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
  }
  // Drop listener
  @HostListener('drop', ['$event']) public drop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileDropped.emit(files);
    }
  }
}
