import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { WebsocketService } from "../_services/websocket.service";
import { GameDataService } from "../_services/game-data.service";

@Injectable({
  providedIn: "root",
})
export class PlayerGuard implements CanActivate {
  constructor(
    private websocketConn: WebsocketService,
    private router: Router,
    private gameSession: GameDataService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkIfPlayerConnected(next);
  }

  private checkIfPlayerConnected(next: ActivatedRouteSnapshot) {
    const gameId = next.params.id;
    if (this.websocketConn.getConnId() !== 0) {
      if (gameId == this.gameSession.getGameId() && gameId !== 0) {
        return true;
      }
    }
    return this.router.parseUrl("/");
  }
}
