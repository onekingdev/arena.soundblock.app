import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeleteArtistPublisherComponent } from './delete-artist-publisher.component';

describe('DeleteArtistPublisherComponent', () => {
  let component: DeleteArtistPublisherComponent;
  let fixture: ComponentFixture<DeleteArtistPublisherComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteArtistPublisherComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteArtistPublisherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
