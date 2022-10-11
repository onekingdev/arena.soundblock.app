import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ProfileService } from 'src/app/services/account/profile';
import { BlockchainService } from 'src/app/services/shared/blockchain';
import { AccountData } from 'src/app/models/account';
import Pusher from 'pusher-js';
import { environment } from 'src/environments/local';
import { AuthService } from 'src/app/services/account/auth';
import { Service } from 'src/app/models/service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BlockchainViewerComponent } from 'src/app/components/common/blockchain-viewer/blockchain-viewer.component';

enum AccountTypes {
  'Simple Distribution' = 'Simple',
  'Blockchain Reporting' = 'Reporting',
  'Blockchain Collaboration' = 'Collaboration',
  'Blockchain Enterprise' = 'Enterprise'
}

@Component({
  selector: 'app-holder',
  templateUrl: './holder.component.html',
  styleUrls: ['./holder.component.scss'],
})
export class HolderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cancelMsg = '';
  cancelDesc = '';

  cancelButtonText = '';
  confirmButtonText = '';

  services: Array<AccountData>;
  planType: string;


  showServiceNameInput: string;
  changeServiceNameLoading: boolean;

  changeServiceNameSuccessMessage: string;
  changeServiceNameErrorMessage: string;

  cancelUuid: any;

  get AccountTypes() {
    return AccountTypes;
  }

  constructor(
    private dialogService: NbDialogService,
    private profileService: ProfileService,
    private authService: AuthService,
    private bsModalService: BsModalService,
    private router: Router,
    private blockchainService: BlockchainService,
  ) { }

  ngOnInit() {
    this.getServiceData();
  }

  onCancelService(ref: any, uuid) {
    this.cancelUuid = uuid;
    this.cancelMsg = 'Are you sure you want to cancel? Your account will revert to our free plan, Simple Distribution.';
    this.cancelDesc = `All of your files will become read-only. You will still have access to download your files,
                      but any music or videos currently deployed to a platform will be removed..`;

    this.cancelButtonText = 'Discard';
    this.confirmButtonText = 'Cancel Service';
    this.showDialog(ref);
  }

  updateServiceName(service) {
    this.changeServiceNameLoading = true;

    this.profileService
      .updateServiceName(service.account_name, service.account_uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showServiceNameInput = '';
        this.changeServiceNameSuccessMessage = 'Service name has been changed successfully';
        setTimeout(() => this.changeServiceNameSuccessMessage = null, 5000);
        this.changeServiceNameLoading = false;
      }, () => {
        this.showServiceNameInput = '';
        this.changeServiceNameErrorMessage = 'There was a problem, please try again later';
        setTimeout(() => this.changeServiceNameErrorMessage = null, 5000);
        this.changeServiceNameLoading = false;
      });
  }

  cancelService(ref: any) {
    // Cancel Service
    this.profileService
      .cancelService(this.cancelUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.getServiceData();
        // Update the bootloader data
        this.profileService.bootLoader().subscribe();
        this.cancelUuid = '';
      });

    this.closeDialog(ref);
  }

  getBillingDate(planDay: number) {
    const curDate = new Date();
    const month = curDate.getMonth();
    const day = curDate.getDay();
    if (day < planDay) {
      curDate.setDate(planDay);
      return curDate;
    } else {
      curDate.setMonth(month + 1);
      return curDate;
    }
  }

  showDialog(ref: any) {
    this.dialogService.open(ref, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  closeDialog(ref: any) {
    ref.close();
  }

  showBlockchainViewer(ledgerUuid) {
    const modal = this.bsModalService.show(BlockchainViewerComponent,{
      ignoreBackdropClick: true,
     initialState: {ledgerUuid},
     class:' blockchain-viewer modal-dialog'
    });
  }

  private getServiceData() {
    // Show the loading indicator after update
    this.profileService.getUserServices().pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.services = services;
        this.services.forEach(service => {
          if(!service.ledger_uuid) {
            this.subscribeToServiceChannel(service.account_uuid);
          }
        })
      });
  }


  private subscribeToServiceChannel(serviceUuid) {
    const pusher = new Pusher(environment.pusherApiKey, {
      authEndpoint: `${environment.apiUrl}broadcasting/auth`,
      cluster: environment.pusherCluster,
      forceTLS: true,
      encrypted: true,
      auth: {
        params: {},
        headers: {
          Authorization: `Bearer ${this.authService.accessToken}`
        }
      },
    });

    const channel = pusher.subscribe(`private-channel.app.soundblock.service.${serviceUuid}.ledger`);

    channel.bind(`Soundblock.Account.${serviceUuid}.Ledger`, (res) => {
      if(res.entity_uuid === serviceUuid ) {
        this.services.forEach(service => {
          if(service.account_uuid === res.entity_uuid) {
          service.ledger_uuid = res.ledger_uuid;
          }
          })
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

}
}
