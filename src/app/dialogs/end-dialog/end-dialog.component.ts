import { Component, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-end-dialog",
  templateUrl: "./end-dialog.component.html",
  styleUrls: ["./end-dialog.component.scss"],
})
export class EndDialogComponent implements OnInit {
  public result: string;

  constructor(
    public dialogRef: MatDialogRef<EndDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.result === "won") {
      this.result = data.result + " :)";
    } else {
      this.result = data.result + " :(";
    }
  }

  ngOnInit(): void {}

  exitGame() {
    this.router.navigate(["/"]);
    this.dialogRef.close();
  }
}
