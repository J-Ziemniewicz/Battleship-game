import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WaitingDialogComponent } from "./waiting-dialog.component";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";

describe("WaitingDialogComponent", () => {
  let component: WaitingDialogComponent;
  let fixture: ComponentFixture<WaitingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WaitingDialogComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
