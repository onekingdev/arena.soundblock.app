import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import { BlockchainService } from 'src/app/services/shared/blockchain';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PanelService } from 'src/app/services/shared/panel';

export class Meta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
export class BlockchainResponse {
  history: any[];
  document: any;
  meta: Meta
}

@Component({
  selector: 'app-blockchain-viewer',
  templateUrl: './blockchain-viewer.component.html',
  styleUrls: ['./blockchain-viewer.component.scss']
})
export class BlockchainViewerComponent implements OnInit {
  ledgerUuid: string;

  private destroy$ = new Subject<void>();
  public meta:Meta;
  tab = 1;
  selectItem;
  public isLoading:boolean;

  records: BlockchainResponse;

  constructor(
    private modalController: ModalController,
    private blockchainService: BlockchainService,
    private panelService: PanelService,
    public BsModalRef: BsModalRef
  ) {
  }

  ngOnInit() {
    this.getBlockChainInfo({page:1, perPage:100});
  }

  openTicketBar() {
    this.BsModalRef.hide();
    this.panelService.setTechnicalSupport({
      type: "Technical Support",
      subject: "Blockchain Viewer Error",
      message: this.ledgerUuid
    });
  }

  selectTab(item, index) {
    this.tab = index;
    this.selectItem = item;
  }

  checkObject(value){
    if(typeof value === 'object'){
      return true;
    }else{
      return false;
    }
  }
  

  onClose() {
    this.modalController.dismiss();
  }

  onPageChange($event): void {
    this.tab = $event;
    this.selectItem = this.records.history[$event-1];
    this.meta = {
      ...this.meta,
      current_page : this.tab
    }
  }

  private getBlockChainInfo(request): void {
    this.isLoading = true;
    this.blockchainService
      .getBlockchainInfo(this.ledgerUuid,request)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.document) {
          this.selectItem = res.history[0];
          this.meta = {
            current_page: 1,
            total: res.history.length,
            last_page: res.history.length,
            per_page: 100
          }
        }

        this.records = res;
        this.isLoading = false;
      });
  }
}
