import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrackArtistPublishersComponent } from './track-artist-publishers.component';

describe('TrackArtistPublishersComponent', () => {
  let component: TrackArtistPublishersComponent;
  let fixture: ComponentFixture<TrackArtistPublishersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackArtistPublishersComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackArtistPublishersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
