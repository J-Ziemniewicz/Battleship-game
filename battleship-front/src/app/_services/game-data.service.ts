import { Injectable } from "@angular/core";

export interface IShip {
  active: boolean;
  set: boolean;
  position: number[][];
}

export interface IMenuState {
  chooseGame: Boolean;
  createGame: Boolean;
  joinGame: Boolean;
  gameId: number;
  playerId: number;
}

export interface IBoardState {
  yourBoard: number[][];
  enemyBoard: number[][];
  yourTurn: Boolean;
}

export interface IGameState {
  gameReady: Boolean;

  shipList: IShip[];
  shipPartsAvailable: number;
  isPlacingShip: boolean;
  usedFields: number[][];
}

@Injectable({
  providedIn: "root",
})
export class GameDataService {
  private menuComponentState: IMenuState;
  private boardComponentState: IGameState;
  private boardState: IBoardState;

  constructor() {}

  clearBoards() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.boardState.enemyBoard[i][j] = 0;
        this.boardState.yourBoard[i][j] = 0;
      }
    }
  }

  updateBoard(board: number, pos: number[], torpedo: number, turn: boolean) {
    switch (board) {
      case 0: {
        this.boardState.yourBoard[pos[0]][pos[1]] = torpedo;
        break;
      }
      case 1: {
        this.boardState.enemyBoard[pos[0]][pos[1]] = torpedo;
        break;
      }
    }
    this.boardState.yourTurn = turn;
    // window.sessionStorage.setItem("boardState", this.boardState);
  }
}
