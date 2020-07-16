import { Component, Inject, AfterViewInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-ship-sunk",
  templateUrl: "./ship-sunk.component.html",
  styleUrls: ["./ship-sunk.component.scss"],
})
export class ShipSunkComponent implements AfterViewInit {
  public sunk: string;

  constructor(
    public dialogRef: MatDialogRef<ShipSunkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.result === true) {
      this.sunk = "YOUR";
    } else {
      this.sunk = "ENEMY";
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, 1000);
  }
}
