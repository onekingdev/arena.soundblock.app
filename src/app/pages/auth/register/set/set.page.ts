import { KeyValue } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, tap, take } from 'rxjs/operators';

import { ProfileService } from 'src/app/services/account/profile';
import { environment } from '../../../../../environments/local';
import { PlanTypes } from 'src/app/models/service';

declare var Stripe;

@Component({
  selector: 'app-set',
  templateUrl: './set.page.html',
  styleUrls: ['./set.page.scss'],
})
export class SetPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cardInfo') cardInfo: ElementRef;

  private destroy$ = new Subject<void>();

  stripe = Stripe(environment.stripeAPIKey);

  cardHandler = this.onChange.bind(this);

  storage : PlanTypes;
  planTypes: PlanTypes[];

  paymentLoading: boolean;

  serviceName = '';
  card: any;
  error: any;

  errors: string[] = [];
  authState: {
    username: string,
    email: string
  };

  originalOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return 0;
  }

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private cd: ChangeDetectorRef, 
  ) {
    const navigation = this.router.getCurrentNavigation();

    this.authState = navigation.extras.state as {
      username: string,
      email: string
    };
  }

  ngOnInit() {
    this.getPlanTypes();
   }


  async getPlanTypes() {
    this.planTypes = [...await   this.profileService.getPlanTypes().pipe(take(1)).toPromise()]; 
    this.storage = this.planTypes[0];
  }

  ngAfterViewInit() {
    const elements = this.stripe.elements();

    this.card = elements.create('card', {
      style: {
        base: {
          iconColor: '#666EE8',
          color: '#31325F',
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

  async onSubmit() {
    this.errors = [];
    this.paymentLoading = true;

    let createApi = this.profileService.createService(this.serviceName, this.storage.dataUUID, null);
    if (this.storage.planName != 'Simple Distribution') {
      const { token, err } = await this.stripe.createToken(this.card);

      const { paymentMethod, error } = await this.stripe.createPaymentMethod(
        'card',
        this.card,
        {
          billing_details: {
            name: this.authState.username
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

    createApi.pipe(
      takeUntil(this.destroy$),
      tap(() => [this.profileService.bootLoader().subscribe(),this.profileService.bootLoaderData().subscribe()])
    )
      .subscribe(res => {
        this.paymentLoading = false;

        this.router.navigate(['/home'], {
          state: {
            ...this.authState,
            plan: res.plan_type,
            confirm: res.payment
          }
        });
      }, err => {
        this.paymentLoading = false;
        for (const error of Object.values(err.error.errors)) {
          this.errors.push(error[0]);
        }
      });
  }

  onSelectStorage(value: PlanTypes) {
    this.storage = value;
    if (value.planName !== 'Simple Distribution') {
      setTimeout(() => {
        this.card.mount(this.cardInfo.nativeElement);
        this.card.addEventListener('change', this.cardHandler);
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
