import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CollectionService } from 'src/app/services/project/collection';
import { JsonPipe,DatePipe } from '@angular/common';
@Component({
  selector: 'app-filehistory',
  templateUrl: './filehistory.component.html',
  styleUrls: ['./filehistory.component.scss'],
})
export class FilehistoryComponent implements OnInit, OnDestroy {
  @Input() fileUuid: any;
  @Input() project: string;
  @Input() category: string;

  historyObs: Observable<any>;
  historyList: any;
  constructor(
    private modalController: ModalController,
    private collectionService: CollectionService,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    if (this.category === 'tracks') {
     this.collectionService.getTrackHistory(this.fileUuid, this.project).subscribe(history => {
      this.historyList  = history.map(updatedHistory => {
          if (updatedHistory.field_name === 'track_release_date') {
            updatedHistory.new_value = this.datepipe.transform(new Date(updatedHistory.new_value),'MM/dd/YYYY');
            updatedHistory.old_value = this.datepipe.transform(new Date(updatedHistory.old_value), 'MM/dd/YYYY');
          }
          return updatedHistory;
        });
      });
    }
    else {
      this.historyObs = this.collectionService.getFileHistory(this.fileUuid);
    }
  }

  convertToObject(json) {
    return JSON.parse(json);
  }


  checkObject(value) {
    if (typeof JSON.parse(value) === 'object') {
      return true;
    } else {
      return false;
    }
  }

  close() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {

  }
}
