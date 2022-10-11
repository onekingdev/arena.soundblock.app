import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.scss'],
})
export class BlockchainComponent implements OnInit, OnDestroy {
  @Input() data: any;

  tab = 1;
  blockchainRecord = [];
  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.data = {
      memo: 'Smart Contract Acceptance',
      blockAddress: {
        strandId: 'JdxjkR9bSYB5jMHWcI464T',
        sequenceNo: 14
      },
      hash: '{wCsmM6qD4STxz0WYmE+47nZvWtcCz9D6zNtCiM5GoWg=}',
      data: {
        VIN: '1N4AL11D75C109151',
        LicensePlateNumber: 'LEWISR261LL',
        State: 'WA',
        City: 'Seattle',
        PendingPenaltyTicketAmount: 90.25,
        ValidFrom: new Date('2017-08-21'),
        ValidTo: new Date('2020-08-21'),
        Owners: {
          PrimaryOwner: '294jJ3YUoH1IEEm8GSabOs',
          SecondaryOwners: '5Ufgdlnj06gF5CWcOIu64s'
        },
        Boolean: true,
        Int: 123456,
        Array: [
          { sam: true },
          { yura: false },
        ],
      },
      metadata: {
        id: '3Qv67yjXEwB9SjmvkuG6Cp',
        version: 0,
        txTime: new Date(),
        txId: 'HgXAkLjAtV0HQ4lNYdzX60'
      }
    };
    const jsonStr = JSON.stringify(this.data);
    const blockData = JSON.parse(jsonStr);
    for (const [name, data] of Object.entries(blockData.data)) {
      this.blockchainRecord.push({
        name,
        data,
        type: this.getValueType(data)
      });
    }
  }

  getValueType(data) {
    if (typeof data === 'number') {
      return data % 1 === 0 ? 'int' : 'float';
    }
    if (Date.parse(data) > 0) {
      return 'date';
    }
    if (typeof data === 'boolean') {
      return 'bool';
    }
    if (typeof data === 'object') {
      return data.length ? 'array' : 'struct';
    }
    return 'string';
  }

  getEntries(obj) {
    const array = [];
    for (const [name, data] of Object.entries(obj)) {
      array.push({
        name,
        data,
        type: this.getValueType(data)
      });
    }
    return array;
  }
  selectTab(index) {
    this.tab = index;
  }
  close() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {

  }
}
