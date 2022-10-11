import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject, combineLatest } from 'rxjs';

import { ProfileService } from 'src/app/services/account/profile';
import { AlertDialogComponent } from 'src/app/components/common/alert-dialog/alert-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { EmailInfo, PhoneInfo } from 'src/app/models/profile';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  emails: EmailInfo[];
  phones: PhoneInfo[];
  primaryPhone: any;
  primaryEmail: any;

  // New Contact Info
  type = '';
  phone = '';
  email = '';

  emailErrorMsg: string;
  emailSuccessMsg: string;

  phoneErrorMsg: string;
  phoneSuccessMsg: string;

  setPrimaryEmailLoading: boolean;
  addEmailLoading: boolean;
  deleteEmailLoading: boolean;

  setPrimaryPhoneLoading: boolean;
  addPhoneLoading: boolean;
  deletePhoneLoading: boolean;

  // Basic Data
  phoneTypes = ['Home', 'Cell', 'Work', 'Other'];
  emailRegEx = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-_]{1,}[.]{1}[a-zA-Z]{2,}/;

  constructor(
    private profileService: ProfileService,
    private modalController: ModalController,
    private bsModalService: BsModalService
  ) { }

  ngOnInit() {
    this.getContactData();
  }

  getContactData() {
    const contactData$ = combineLatest([
      this.profileService.getProfileEmailInfo(null, 20),
      this.profileService.getProfilePhoneInfo(null, 20)
    ]);

    contactData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(([emails, phones]) => {
        this.emails = emails;
        this.primaryEmail = this.emails.find(x => x.flag_primary);

        this.phones = phones;
        this.primaryPhone = this.phones.find(x => x.flag_primary);
      });
  }

  // Email Section
  addEmail() {
    if (!this.emailRegEx.test(this.email)) {
      return;
    }

    this.addEmailLoading = true;

    this.profileService.addEmail(this.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.emails.push(res);
      }, (error) => {
        this.showErrorMessage(error.error.status.message);
        this.addEmailLoading = false;
      }, () => {
        this.email = '';
        this.addEmailLoading = false;
        this.showSuccessMessage('Email added, please check your inbox for verification');
      });
  }

  setPrimaryEmail(email: EmailInfo) {
    if (!email.flag_verified || email.flag_primary) {
      return;
    }

    this.setPrimaryEmailLoading = true;

    this.profileService.setPrimaryEmail(this.primaryEmail.user_auth_email,email.user_auth_email)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emails.forEach(x => x.flag_primary = 0);
        email.flag_primary = 1;

        this.primaryEmail = email;
      }, (error) => {
        this.showErrorMessage(error.error.status.message);
        this.setPrimaryEmailLoading = false;
      }, () => {
        this.setPrimaryEmailLoading = false;
        this.showSuccessMessage('Primary email updated successfully');
        this.sortEmails();
      });
  }

  deleteEmail(email: EmailInfo) {
    const modal =  this.bsModalService.show(AlertDialogComponent,{
    class:'modal-dialog-centered',
    initialState: {
      title: 'Confirm',
      message:'Do you want delete this email?',
      description: ''
    }
  });
  modal.content.confirmed.pipe(takeUntil(modal.onHidden)).subscribe(res => {
      if (res.data) {
        this.deleteEmailLoading = true;

        this.profileService.deleteEmail(email.user_auth_email)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.emails = this.emails.filter(x => x !== email);
          }, (error) => {
            this.deleteEmailLoading = false;
            this.showErrorMessage(error.error.status.message);
          }, () => {
            this.deleteEmailLoading = false;
          });
      }
    });
  }

  // Phone Section
  addPhone() {
    if (!this.phone || !this.type) { return; }

    this.addPhoneLoading = true;

    this.profileService.addPhone(this.type, this.phone, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.phones.push(res);
      }, (error) => {
        this.addPhoneLoading = false;
        this.showErrorMessage(error.error.status.message, true);
      }, () => {
        this.addPhoneLoading = false;
        this.showSuccessMessage('Phone added successfully', true);
        this.type = '';
        this.phone = '';
      });
  }

  setPrimaryPhone(phoneInfo: PhoneInfo) {
    this.setPrimaryPhoneLoading = true;

    this.profileService.setPrimaryPhone(phoneInfo.phone_number)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.phones.forEach(phone => {
          phone.flag_primary = 0;
        });

        phoneInfo.flag_primary = 1;

        this.primaryPhone = phoneInfo;
      }, (error) => {
        this.setPrimaryPhoneLoading = false;
        this.showErrorMessage(error.error.status.message, true);
      }, () => {
        this.setPrimaryPhoneLoading = false;
        this.showSuccessMessage('Primary phone number updated successfully', true);
      });
  }

  deletePhone(phone: PhoneInfo) {
    const modal =  this.bsModalService.show(AlertDialogComponent,{
      class:'modal-dialog-centered',
      initialState: {
        title: 'Confirm',
        message:'Do you want delete this phone?',
        description: ''
      }
    });
    modal.content.confirmed.pipe(takeUntil(modal.onHidden)).subscribe(res => {
      if(res?.data) {
        this.deletePhoneLoading = true;

        this.profileService.deletePhone(phone.phone_number)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => {
            this.phones = this.phones.filter(x => x !== phone);
          }, (error) => {
            this.deletePhoneLoading = false;
            this.showErrorMessage(error.error.status.message, true);
          }, () => {
            this.deletePhoneLoading = false;
            this.showSuccessMessage('Phone deleted successfully', true);
          });
      }
    })
  }

  private showSuccessMessage(message: string, phone: boolean = false) {
    if (phone) {
      this.phoneSuccessMsg = message;
      setTimeout(() => this.phoneSuccessMsg = null, 5000);
    } else {
      this.emailSuccessMsg = message;
      setTimeout(() => this.emailSuccessMsg = null, 5000);
    }
  }

  private showErrorMessage(message: string, phone: boolean = false) {
    if (phone) {
      this.phoneErrorMsg = message;
      setTimeout(() => this.phoneErrorMsg = null, 5000);
    } else {
      this.emailErrorMsg = message;
      setTimeout(() => this.emailErrorMsg = null, 5000);
    }
  }

  private sortEmails() {
    this.emails = this.emails.sort((a, b) => {
      if (a.flag_primary > b.flag_primary) {
        return -1;
      }
      if (a.flag_primary < b.flag_primary) {
        return 1;
      }

      return 0;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
