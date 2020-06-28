import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  ActivatedRoute,
} from "@angular/router";
import { Observable } from "rxjs";
import { WebsocketService } from "../_services/websocket.service";
import { GameDataService } from "../_services/game-data.service";
import { cpuUsage } from "process";

@Injectable({
  providedIn: "root",
})
export class PlayerGuard implements CanActivate {
  constructor(
    private websocketConn: WebsocketService,
    private router: Router,
    private gameSession: GameDataService,
    private activatedRouter: ActivatedRoute
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkIfPlayerConnected(next);
  }

  private checkIfPlayerConnected(next: ActivatedRouteSnapshot) {
    const gameId = next.params.id;
    console.log("gameId from url " + gameId);
    console.log("gamesession " + this.gameSession.getGameId());
    if (this.websocketConn.getConnId() !== 0) {
      console.log("web connection exist");
      if (gameId == this.gameSession.getGameId() && gameId !== 0) {
        console.log("entered game");
        return true;
      }
    }
    return this.router.parseUrl("/");
  }
}
