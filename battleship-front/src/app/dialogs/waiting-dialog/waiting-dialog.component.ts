import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { WebsocketService } from "src/app/_services/websocket.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { GameDataService } from "src/app/_services/game-data.service";

export interface IMessage {
  type: string;
  gameId?: number;
  shipPos?: number[][];
  playerId?: number;
  result?: string;
  board?: number;
  torpedoPos?: number[];
  hit?: number;
}

@Component({
  selector: "app-waiting-dialog",
  templateUrl: "./waiting-dialog.component.html",
  styleUrls: ["./waiting-dialog.component.scss"],
})
export class WaitingDialogComponent implements OnInit {
  private wsConnection: Subject<any>;
  constructor(
    public dialogRef: MatDialogRef<WaitingDialogComponent>,
    private websocketConn: WebsocketService,
    private router: Router,
    private gameSession: GameDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.wsConnection = this.websocketConn.connect(environment.wsEndpoint);
  }

  ngOnInit(): void {}

  createMessage(type: string) {
    let msg = {
      type: type,
      gameId: this.data.gameId,
    } as IMessage;
    return msg;
  }

  exitGame() {
    const msg = this.createMessage("exitGame");
    console.log(msg);
    this.wsConnection.next(msg);
    this.gameSession.resetService();
    this.router.navigate(["/"]);
    this.dialogRef.close();
  }
}
