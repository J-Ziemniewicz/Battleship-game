import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipSunkComponent } from './ship-sunk.component';

describe('ShipSunkComponent', () => {
  let component: ShipSunkComponent;
  let fixture: ComponentFixture<ShipSunkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipSunkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipSunkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
