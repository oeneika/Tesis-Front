import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVideoPlayerComponent } from './app-video-player.component';

describe('AppVideoPlayerComponent', () => {
  let component: AppVideoPlayerComponent;
  let fixture: ComponentFixture<AppVideoPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppVideoPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
