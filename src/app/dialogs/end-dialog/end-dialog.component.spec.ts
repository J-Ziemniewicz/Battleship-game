import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EndDialogComponent } from "./end-dialog.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { RouterTestingModule } from "@angular/router/testing";

describe("EndDialogComponent", () => {
  let component: EndDialogComponent;
  let fixture: ComponentFixture<EndDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EndDialogComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            data: {
              result: "won",
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
