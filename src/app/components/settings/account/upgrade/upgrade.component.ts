import { HttpErrorResponse } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { AccountData } from 'src/app/models/account';

import { ProfileService } from 'src/app/services/account/profile';
import { environment } from 'src/environments/local';
import { PlanTypes } from 'src/app/models/service';

declare var Stripe;

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardInfo') cardInfo: ElementRef;

  private destroy$ = new Subject<void>();

  stripe = Stripe(environment.stripeAPIKey);
  cardHandler = this.onChange.bind(this);

  mode = 'Create';
  serviceName: string;
  storage : PlanTypes;
  curServiceType : PlanTypes;

  service: AccountData;
  planTypes: PlanTypes[];

  paymentLoading: boolean;

  card: any;
  error: any;

  listenerAdded = false;
  errors: string[] = [];

  originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return 0;
  };

  constructor(
    private cd: ChangeDetectorRef,
    private profileService: ProfileService,
    private router: Router,
    private actiavedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.getPlanTypes();;
    this.actiavedRoute.params.subscribe(params => {
      if (params.id) {
        this.mode = 'Upgrade';
        this.getServiceInfo(params.id);
      } else {
        this.mode = 'Create';
      }
    });

  }

  async getPlanTypes() {
    this.planTypes = [...await   this.profileService.getPlanTypes().pipe(take(1)).toPromise()]; 
    this.curServiceType = this.planTypes[0];
    this.storage = this.planTypes[0];
  }

  ngAfterViewInit() { // Initiate Credit Card Element
    const elements = this.stripe.elements();
    this.card = elements.create('card', {
      style: {
        base: {
          iconColor: '#666EE8',
          color: '#31325F',
          padding: '',
          fontWeight: 300,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px',
          '::placeholder': {
            color: '#aaaaaa'
          }
        }
      }
    });
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  getServiceInfo(uuid) {
    this.profileService.getServiceInfo(uuid).pipe(takeUntil(this.destroy$)).subscribe(service => {
      this.service = service;
      if (service.account_name) {
        this.serviceName = service.account_name;
      }

      if (service.active_plan) {
        const activePlan = this.planTypes.filter(planType => service.active_plan.plan_type_uuid === planType.dataUUID)[0]
        this.storage = activePlan;
        this.curServiceType = activePlan;
        if (this.storage.planName !== 'Simple Distribution') {
          setTimeout(() => {
            this.listenerAdded = true;
            this.card.mount(this.cardInfo.nativeElement);
            this.card.addEventListener('change', this.cardHandler);
          }, 0);
        }
      }
    }, (error: HttpErrorResponse) => {
      if (error.status === 400) {
        this.service = {} as AccountData;
      }
    });
  }

  onSelectStorage(value: PlanTypes) {
    this.storage = value;

    if (value.planName !== 'Simple Distribution') {
      setTimeout(() => {
        this.listenerAdded = true;
        this.card.mount(this.cardInfo.nativeElement);
        this.card.addEventListener('change', this.cardHandler);
      }, 0);
    }
  }

  async onUpgrade() {
    this.paymentLoading = true;
    let service$ = this.profileService.updateService(this.service.account_uuid, this.storage.dataUUID, null);
    if (this.storage.planName !== 'Simple Distribution') {
      const { token, err } = await this.stripe.createToken(this.card);

      const { paymentMethod, error } = await this.stripe.createPaymentMethod(
        'card',
        this.card,
        {
          billing_details: {
            name: this.profileService.user.value.name
          }
        }
      );

      if (error) {
        this.error = error.message;
        this.paymentLoading = false;
        return;
      }
      service$ = this.profileService.updateService(this.service.account_uuid, this.storage.dataUUID, paymentMethod.id);
    }

    service$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.profileService.bootLoader().subscribe();
        this.router.navigate(['settings/accounts']);
      },
        () => this.paymentLoading = false,
        () => this.paymentLoading = false
      );
  }

  async onCreate() {
    this.errors = [];
    this.paymentLoading = true;
    let createApi = this.profileService.createService(this.serviceName, this.storage.dataUUID, null);
    if (this.storage.planName !== 'Simple Distribution') {
      const { token, err } = await this.stripe.createToken(this.card);

      const { paymentMethod, error } = await this.stripe.createPaymentMethod(
        'card',
        this.card,
        {
          billing_details: {
            name: this.profileService.user.value.name
          }
        }
      );

      if (error) {
        this.error = error.message;
        this.paymentLoading = false;
        return;
      }
      createApi = this.profileService.createService(this.serviceName, this.storage.dataUUID, paymentMethod.id);
    }

    createApi.pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.paymentLoading = false;
        this.profileService.bootLoader().subscribe();
        this.router.navigate(['settings/accounts']);
      }, err => {
        this.paymentLoading = false;
        for (const error of Object.values(err.error.errors)) {
          this.errors.push(error[0]);
        }
      });
  }

  ngOnDestroy() {
    if (this.card) {
      if (this.listenerAdded) {
        this.card.removeEventListener('change', this.cardHandler);
      }
      this.card.destroy();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
