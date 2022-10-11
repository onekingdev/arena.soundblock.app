import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { Observable, empty, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BankingInfo, PaypalInfo } from 'src/app/models/profile';

import { ProfileService } from 'src/app/services/account/profile';

import { environment } from 'src/environments/local';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  paypalObs: Observable<any>;
  bankObs: Observable<any>;
  banks: BankingInfo[];
  paypals: PaypalInfo[];

  // New Payment Info
  formType = 0;
  paypalEmail: any = '';
  bankForm: FormGroup;
  accountType = '';
  submitted = false;

  // Delete Payment Info
  deletePaymentInfo: any;
  deletePaymentType = '';

  addAccountLoading: boolean;
  setPrimaryPaymentLoading: boolean;

  emailRegEx = /[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-_]{1,}[.]{1}[a-zA-Z]{2,}/;

  cloudUrl = environment.cloudUrl;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialogService: NbDialogService,
    private profileService: ProfileService,
  ) { }

  ngOnInit() {
    this.initData();
    this.getPaymentData();
  }

  getPaymentData() {
    this.paypalObs = this.profileService.getPaypal();
    this.paypalObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(paypals => {
        this.paypals = paypals;
      });

    this.bankObs = this.profileService.getBank();
    this.bankObs
      .pipe(takeUntil(this.destroy$))
      .subscribe(banks => {
        this.banks = banks;
      });
  }

  initData() {
    this.bankForm = this.fb.group({
      bankName: ['', Validators.required],
      accountType: ['', Validators.required],
      accountNumber: ['', Validators.required],
      routingNumber: ['', Validators.required],
    });
    this.paypalEmail = '';
  }

  get bankformControls() {
    return this.bankForm.controls;
  }

  navigate(step) {
    this.router.navigate([`/${step}`]);
  }

  createPaypal() {
    if (!this.paypalEmail || !this.emailRegEx.test(this.paypalEmail)) {
      this.submitted = true;
      return;
    }

    this.profileService.addPaypal(this.paypalEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.paypals.push(res);
        this.submitted = false;
      });

    this.initData();
  }

  createAccount(form) {
    if (!form.valid) {
      this.submitted = true;
      return;
    }

    this.addAccountLoading = true;

    const bankAccount = {
      name: this.bankformControls.bankName.value,
      accountType: this.bankformControls.accountType.value,
      accountNumber: this.bankformControls.accountNumber.value + '',
      routingNumber: this.bankformControls.routingNumber.value,
    };

    this.profileService.addBankAccount(bankAccount)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.banks.push(res);
        this.submitted = false;
      }, (error) => {
        this.addAccountLoading = false;
      }, () => {
        this.addAccountLoading = false;
      });

    this.initData();
  }

  setPrimaryPayment(event) {
    const payment = event.detail.value;

    this.setPrimaryPaymentLoading = true;

    this.profileService.setPrimaryPayment(payment)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.banks = this.banks.map(x => {
          x.flag_primary = 0;
          return x;
        });

        this.paypals = this.paypals.map(x => {
          x.flag_primary = 0;
          return x;
        });

        payment.flag_primary = true;
      }, () => {
        this.setPrimaryPaymentLoading = false;
      }, () => {
        this.setPrimaryPaymentLoading = false;
      });
  }

  deletePayment(ref) {
    if (this.deletePaymentType === 'bank') {
      this.profileService.deleteBankAccount(this.deletePaymentInfo.bank_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.banks = this.banks.filter(x => x !== this.deletePaymentInfo);
        });
    } else if (this.deletePaymentType === 'paypal') {
      this.profileService.deletePaypal(this.deletePaymentInfo.paypal_uuid)
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.paypals = this.paypals.filter(x => x !== this.deletePaymentInfo);
        });
    }

    ref.close();
  }

  showForm(type) {
    this.formType = type;
  }

  delete(ref, info, type) {
    this.deletePaymentInfo = info;
    this.deletePaymentType = type;

    this.dialogService.open(ref, {
      closeOnBackdropClick: false,
      closeOnEsc: false
    });
  }

  closeDialog(ref: any) {
    ref.close();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
