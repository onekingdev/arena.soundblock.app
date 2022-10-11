import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit {
  @Input() title: string;
  @Input() message: string;
  @Input() description: string;
  @Output() confirmed: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private modalController: BsModalRef
  ) { }

  ngOnInit() {}

  onClose() {
    this.modalController.hide();
  }

  onConfirm() {
    this.modalController.hide();
    this.confirmed.emit({
      data: true
    });
  }
}
