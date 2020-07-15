import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ShipSunkComponent } from "./ship-sunk.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

describe("ShipSunkComponent", () => {
  let component: ShipSunkComponent;
  let fixture: ComponentFixture<ShipSunkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipSunkComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipSunkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
