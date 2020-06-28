import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { WebsocketService } from "../_services/websocket.service";
import { environment } from "../../environments/environment";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { GameDataService } from "../_services/game-data.service";

export interface IMenuState {
  chooseGame: Boolean;
  createGame: Boolean;
  joinGame: Boolean;
  gameId: number;
  playerId: number;
}

interface IMessage {
  type: string;
  gameId?: number;
  shipPos?: any;
  playerId?: number;
  result?: string;
  board?: number;
  position?: any;
  hit?: number;
}

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
  public chooseGame: boolean;
  public createGame: boolean;
  public joinGame: boolean;
  public gameId = 0;
  private playerId = 0;

  private wsConnection: Subject<any>;
  @ViewChild("gameIdInput", { static: false }) gameIdInput: ElementRef;

  constructor(
    private websocketConn: WebsocketService,
    private router: Router,
    private gameSession: GameDataService
  ) {}

  ngOnInit() {
    this.loadData();
    this.wsConnection = this.websocketConn.connect(environment.wsEndpoint);
    this.wsConnection.subscribe((msg) => {
      console.log(msg);
      const reader = new FileReader();
      reader.onloadend = (e) => {
        let text = reader.result as string;
        const object = JSON.parse(text);
        this.parseMsg(object);
        console.log(object);
      };

      reader.readAsText(msg.data);
    });
  }

  private loadData() {
    const sessionState = this.gameSession.getMenuState();
    this.chooseGame = sessionState.chooseGame;
    this.createGame = sessionState.createGame;
    this.joinGame = sessionState.joinGame;
    this.gameId = sessionState.gameId;
  }

  public exitGame() {
    if (this.createGame) {
      const msg = this.createMessage("exitGame");
      this.wsConnection.next(msg);
    }
    this.gameSession.resetService();
    this.loadData();
  }

  parseMsg(msg: Object) {
    switch (msg["type"]) {
      case "newGame": {
        this.gameId = msg["gameId"];
        this.gameSession.setGameId(this.gameId);
        this.createGame = true;
        this.gameSession.setCreateGame(this.createGame);
        break;
      }
      case "joinGame": {
        if (msg["result"] === 0) {
          this.router.navigateByUrl("/battle/" + this.gameId);
        } else {
          alert("Connection failed");
        }
        break;
      }
      case "playerId": {
        const connId = this.websocketConn.getConnId();
        console.log(connId);
        if (connId !== 0) {
          if (msg["playerId"] !== connId) {
            const newMsg = this.createMessage("playerId", connId);
            this.wsConnection.next(newMsg);
            console.log(msg["playerId"]);
          }
        } else {
          this.websocketConn.setConnId(msg["playerId"]);
        }
        break;
      }
    }
  }

  startGame() {
    this.chooseGame = true;
    this.gameSession.setChooseGame(this.chooseGame);
    console.log(this.playerId);
  }

  createNewGame() {
    const msg = this.createMessage("newGame");
    this.gameSession.setGameId(this.gameId);
    this.wsConnection.next(msg);
  }

  renderJoinGame() {
    this.joinGame = true;
    this.gameSession.setJoinGame(this.joinGame);
  }

  joinExistingGame() {
    this.gameId = parseInt(this.gameIdInput.nativeElement.value, 10);
    const msg = this.createMessage("joinGame");
    if (msg.gameId >= 100000 && msg.gameId <= 999999) {
      console.log(msg);
      this.gameSession.setGameId(this.gameId);
      this.wsConnection.next(msg);
    } else {
      alert("Please enter correct game ID");
    }
  }

  createMessage(type: string, playerId?: number) {
    let msg: IMessage;
    switch (type) {
      case "newGame": {
        msg = { type: "newGame" };
        break;
      }
      case "joinGame": {
        msg = { type: "joinGame" };
        msg.gameId = parseInt(this.gameIdInput.nativeElement.value, 10);
        break;
      }
      case "playerId": {
        msg = {
          type: type,
          playerId: playerId,
        };
        break;
      }
      case "exitGame": {
        msg = { type: type, gameId: this.gameId };
        break;
      }
    }
    return msg;
  }

  // TODO: Validation function
  // validateGameId() {
  //   const testGameId = this.gameIdInput.nativeElement.value

  // }
}
