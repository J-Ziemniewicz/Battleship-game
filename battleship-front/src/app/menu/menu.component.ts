import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { WebsocketService } from "../_services/websocket.service";
import { environment } from "../../environments/environment";
import { Subject } from "rxjs";
import { Router } from "@angular/router";

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
export class MenuComponent implements OnInit, AfterViewInit {
  private chooseGame: Boolean = false;
  private createGame: Boolean = false;
  private joinGame: Boolean = false;
  private gameId = 0;

  private wsConnection: Subject<any>;
  @ViewChild("gameIdInput", { static: false }) gameIdInput: ElementRef;

  constructor(
    private websocketConn: WebsocketService,
    private router: Router
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {}

  startGame() {
    this.chooseGame = true;
    this.wsConnection = this.websocketConn.connect(environment.wsEndpoint);
    this.wsConnection.subscribe((msg) => {
      console.log(msg);
      const reader = new FileReader();
      reader.onloadend = (e) => {
        let text = reader.result as string;
        const object = JSON.parse(text);
        if (object["type"] === "newGame") {
          this.gameId = object["gameId"];
          this.createGame = true;
        } else if (object["type"] === "joinGame") {
          if (object["result"] === 0) {
            this.router.navigate(["/battle/" + this.gameId]);
          } else {
            alert("Connection failed");
          }
        }
        console.log(object);
      };

      reader.readAsText(msg.data);
    });
  }

  createNewGame() {
    const msg = this.createMessage("newGame");
    this.wsConnection.next(msg);
  }

  renderJoinGame() {
    this.joinGame = true;
  }

  joinExistingGame() {
    this.gameId = parseInt(this.gameIdInput.nativeElement.value, 10);
    const msg = this.createMessage("joinGame");
    this.wsConnection.next(msg);
  }

  createMessage(type: string) {
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
    }
    return msg;
  }

  // TODO: Validation function
  // validateGameId() {
  //   const testGameId = this.gameIdInput.nativeElement.value

  // }
}
