import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { HomePage } from './home.page';
import { AuthService } from 'src/app/services/account/auth';
import { NotificationService } from 'src/app/services/support/notification';
import { ProfileService } from 'src/app/services/account/profile';


describe('SignInPage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let helper: Helper;
  let dHelper: DOMHelper;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomePage, FooterComponent ],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        RouterTestingModule,
      ],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    helper = new Helper();
    dHelper = new DOMHelper(fixture);
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

class DOMHelper {
  private fixture: ComponentFixture<HomePage>;
  constructor(fixture: ComponentFixture<HomePage>) {
    this.fixture = fixture;
  }
}
