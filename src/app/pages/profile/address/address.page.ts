import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';

import { ProfileService } from 'src/app/services/account/profile';
import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { AddressInfo } from 'src/app/models/profile';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  addresses: AddressInfo[];

  addressesLoaded: boolean;

  primaryAddress: any;

  // New Address
  address = {
    type: '',
    street: '',
    city: '',
    zipCode: '',
  };

  addressTypes = ['Home', 'Office', 'Billing', 'Other'];

  constructor(
    private profileService: ProfileService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    this.getAddressInfo();
  }

  getAddressInfo() {
    this.profileService.getAddress(null, 30)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.addresses = res;
        this.addressesLoaded = true;
      });
  }

  addAddress() {
    this.profileService.addAddress(this.address)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.addresses.push(res);

        // Clear the form only if the address is successfully added
        this.address = {
          type: '',
          street: '',
          city: '',
          zipCode: '',
        };
      });
  }

  deleteAddress(address: AddressInfo) {
    this.showConfirmation('Do you want delete this address?', address);
  }

  showConfirmation(message: string, address) {
    const modal = this.bsModalService.show(AlertDialogComponent,{
      class:'modal-dialog-centered',
      initialState: {
        title: 'Confirm',
        message,
        description: ''
      }
    });
   modal.content.confirmed.pipe(takeUntil(modal.onHidden)).subscribe(res => {
    if (res.data) {
      this.profileService.deleteAddress(address.postal_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.addresses = this.addresses.filter(x => x !== address);
        });
    }
      modal.hide();
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
