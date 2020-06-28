import { Injectable } from "@angular/core";

export interface IShip {
  active: boolean;
  set: boolean;
  position: number[][];
}

export interface IMenuState {
  chooseGame: boolean;
  createGame: boolean;
  joinGame: boolean;
  gameId: number;
}

export interface IBoardState {
  yourBoard: number[][];
  enemyBoard: number[][];
  yourTurn?: boolean;
}

export interface IGameState {
  gameReady: boolean;
  waitingForEnemy: boolean;
  shipList?: IShip[];
  // shipPartsAvailable?: number;
  // isPlacingShip?: boolean;
  // usedFields?: number[][];
  boards?: IBoardState;
}

@Injectable({
  providedIn: "root",
})
export class GameDataService {
  private menuComponentState: IMenuState;
  private boardComponentState: IGameState;
  private boardState: IBoardState;

  constructor() {
    this.initService();
    console.log("Initialize gameDataService");
    console.log(this.menuComponentState);
    console.log(this.boardComponentState);
    console.log(this.boardState);
    if (sessionStorage.getItem("menuState") !== null) {
      this.menuComponentState = JSON.parse(
        sessionStorage.getItem("menuState")
      ) as IMenuState;
      console.log(sessionStorage.getItem("menuState"));
    }
    if (sessionStorage.getItem("boardCompState") !== null) {
      this.boardComponentState = JSON.parse(
        window.sessionStorage.getItem("boardCompState")
      ) as IGameState;
    }
    if (sessionStorage.getItem("boardState") !== null) {
      this.boardState = JSON.parse(
        sessionStorage.getItem("boardState")
      ) as IBoardState;
    }
  }

  private initService() {
    this.boardComponentState = { gameReady: false, waitingForEnemy: false };
    this.menuComponentState = {
      chooseGame: false,
      createGame: false,
      joinGame: false,
      gameId: 0,
    };
    this.boardState = { yourBoard: [], enemyBoard: [] };
    this.clearBoards();
  }

  private clearBoards() {
    for (let i = 0; i < 10; i++) {
      this.boardState.enemyBoard[i] = [];
      this.boardState.yourBoard[i] = [];
      for (let j = 0; j < 10; j++) {
        this.boardState.enemyBoard[i][j] = -1;
        this.boardState.yourBoard[i][j] = -1;
      }
    }
    console.log(this.boardState);
  }

  // Reset service data after end/leave game

  public resetService() {
    this.initService();
    sessionStorage.removeItem("menuState");
    sessionStorage.removeItem("boardCompState");
    sessionStorage.removeItem("boardState");
  }
  // Menu Component State

  public setChooseGame(chooseGame: boolean) {
    this.menuComponentState.chooseGame = chooseGame;
    sessionStorage.setItem(
      "menuState",
      JSON.stringify(this.menuComponentState)
    );
  }

  public setCreateGame(createGame: boolean) {
    this.menuComponentState.createGame = createGame;
    sessionStorage.setItem(
      "menuState",
      JSON.stringify(this.menuComponentState)
    );
  }

  public setJoinGame(joinGame: boolean) {
    this.menuComponentState.joinGame = joinGame;
    sessionStorage.setItem(
      "menuState",
      JSON.stringify(this.menuComponentState)
    );
  }

  public setGameId(id: number) {
    this.menuComponentState.gameId = id;
    sessionStorage.setItem(
      "menuState",
      JSON.stringify(this.menuComponentState)
    );
  }

  public getMenuState() {
    return this.menuComponentState;
  }

  // Board Component State

  public setGameReady(gameReady: boolean) {
    this.boardComponentState.gameReady = gameReady;
    sessionStorage.setItem(
      "boardCompState",
      JSON.stringify(this.boardComponentState)
    );
  }

  public setWaitingForEnemy(waitingForEnemy: boolean) {
    this.boardComponentState.waitingForEnemy = waitingForEnemy;
    sessionStorage.setItem(
      "boardCompState",
      JSON.stringify(this.boardComponentState)
    );
  }

  public setShipPos(shipsPos: IShip[]) {
    this.boardComponentState.shipList = shipsPos;
    sessionStorage.setItem(
      "boardCompState",
      JSON.stringify(this.boardComponentState)
    );
  }

  public updateBoard(
    board: number,
    pos: number[],
    torpedo: number,
    turn: boolean
  ) {
    console.log("board " + board);
    console.log("pos " + pos);
    console.log("torpedo " + torpedo);
    console.log("turn " + turn);
    console.log(this.boardState);
    switch (board) {
      case 0: {
        // this.boardState.yourBoard[pos[0]][pos[1]] = torpedo;
        console.log(this.boardState.yourBoard);
        break;
      }
      case 1: {
        this.boardState.enemyBoard[pos[0]][pos[1]] = torpedo;
        break;
      }
    }
    this.boardState.yourTurn = turn;
    window.sessionStorage.setItem(
      "boardState",
      JSON.stringify(this.boardState)
    );
  }

  public getGameState() {
    if (this.boardComponentState.gameReady) {
      this.boardComponentState.boards = this.boardState;
    }
    return this.boardComponentState;
  }
}
