import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Component } from '@angular/core';

import { SignInPage } from './sign-in.page';
import { AuthService } from 'src/app/services/account/auth';
import { NotificationService } from 'src/app/services/support/notification';
import { ProfileService } from 'src/app/services/account/profile';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('SignInPage', () => {
  let component: SignInPage;
  let fixture: ComponentFixture<SignInPage>;
  let helper: Helper;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInPage, FooterComponent ],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(SignInPage);
    component = fixture.componentInstance;
    helper = new Helper();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({ template: '', selector: 'app-page-footer' })
class FooterComponent {}

class Helper {

}
