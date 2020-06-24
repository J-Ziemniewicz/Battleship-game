import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Inject,
} from "@angular/core";
import { WebsocketService } from "../_services/websocket.service";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface Ship {
  active: boolean;
  set: boolean;
  position: number[][];
}

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
  @ViewChild("canvas", { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  public gameReady: boolean = false;

  private ctx: CanvasRenderingContext2D;

  private tileSize: number = 42;
  private yourBoardX: number = this.tileSize;
  private yourBoardY: number = 3 * this.tileSize;

  private colorShip: string = "#edae49";
  private colorGrayShip: string = "#a5a4a4";
  private colorGrayGrid: string = "#707070";
  private colorRed: string = "#d1495B";

  private shipList: Ship[] = [];
  private shipPartsAvailable: number;
  private isPlacingShip: boolean = false;
  private usedFields: number[][] = [];

  private lightningImg: HTMLImageElement;

  private wsConnection: Subject<any>;
  private gameId = 0;

  constructor(
    private websocketConn: WebsocketService,
    private router: ActivatedRoute // @Inject(MAT_DIALOG_DATA) public Id: number
  ) {
    this.wsConnection = this.websocketConn.connect(environment.wsEndpoint);
    this.wsConnection.subscribe((msg) => {
      console.log(msg);
      const reader = new FileReader();
      reader.onloadend = (e) => {
        let text = reader.result as string;
        const object = JSON.parse(text);
        console.log(object);
      };

      reader.readAsText(msg.data);
    });
  }

  ngOnInit(): void {
    this.canvas.nativeElement.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
    this.ctx = this.canvas.nativeElement.getContext("2d");

    for (let i = 0; i < 5; i++) {
      const tempShip = {} as Ship;
      tempShip.active = false;
      tempShip.position = [];
      tempShip.set = false;
      this.shipList.push(tempShip);
    }

    this.lightningImg = new Image();
    this.lightningImg.src = "../assets/images/lightning.png";
    this.drawBoard(this.yourBoardX, this.yourBoardY, "YOU");
    this.drawShips(this.yourBoardX, this.yourBoardY);
  }

  // Odkomentować warunek sprawdzający ustawienie wszystkich statków
  ready() {
    // console.log("Game ready: " + this.gameReady);
    if (this.allShipSet()) {
      this.gameReady = true;
      this.canvas.nativeElement.width = 1008;
      this.drawBoard(this.yourBoardX, this.yourBoardY, "YOU");
      this.redrawPlacedShips();
      this.drawBoard(
        this.yourBoardX + 13 * this.tileSize,
        this.yourBoardY,
        "ENEMY"
      );
    } else {
      alert("You have to place all ships on board before starting game");
    }
  }

  reset() {
    for (let i = 0; i < 5; i++) {
      this.shipList[i].active = false;
      this.shipList[i].position = [];
      this.shipList[i].set = false;
    }

    this.drawBoard(this.yourBoardX, this.yourBoardY, "YOU");
    this.drawShips(this.yourBoardX, this.yourBoardY);
    this.shipPartsAvailable = 0;
    this.usedFields = [];
    this.isPlacingShip = false;
  }

  allShipSet() {
    for (let i = 0; i < 5; i++) {
      if (!this.shipList[i].set) {
        return false;
      }
    }
    return true;
  }

  redrawPlacedShips() {
    this.shipList.forEach((ship) => {
      for (let i = 0; i < ship.position.length; i++) {
        this.fillRectangle(
          ship.position[i][0],
          ship.position[i][1],
          this.colorShip
        );
      }
    });
  }

  getMousePos(event) {
    let rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left - this.yourBoardX;
    const y = event.clientY - rect.top - this.yourBoardY;
    const xPos = Math.floor((x - 1) / this.tileSize);
    const yPos = Math.floor((y - 1) / this.tileSize);
    // console.log("Pixel position: x -> " + x + " y -> " + y);
    return {
      xPos,
      yPos,
    };
  }

  handleClick(event) {
    let pos = this.getMousePos(event);
    const posx = pos.xPos;
    const posy = pos.yPos;

    // console.log("\n" + posx + " " + posy);
    if (!this.gameReady) {
      this.checkIfShipClicked(posx, posy);
      if (this.isPlacingShip) {
        if (posx < 10 && posy < 10) {
          this.placeShip(posx, posy);
        }
      }
    } else {
      if (posx < 23 && posx > 12 && posy >= 0 && posy < 10) {
        // console.log("Clicked on enemy board");
        this.fillHit(posx, posy, 1);
      }
    }
  }

  placeShip(xPos: number, yPos: number) {
    // console.log("Dostępne elementy łodzi " + this.shipPartsAvailable);
    if (this.shipPartsAvailable > 0) {
      for (let i = 0; i < this.shipList.length; i++) {
        if (this.shipList[i].active) {
          // console.log("Statek jest aktywny: " + i);
          if (this.isEmptyField(xPos, yPos)) {
            let len = this.shipList[i].position.length;
            // console.log("Długość list statku " + i + " : " + len);
            if (len == 0) {
              this.fillRectangle(xPos, yPos, this.colorGrayShip);
              this.shipList[i].position.push([xPos, yPos]);
              this.usedFields.push([xPos, yPos]);
              this.shipPartsAvailable--;
            } else if (len == 1) {
              if (
                (xPos == this.shipList[i].position[0][0] &&
                  (yPos == this.shipList[i].position[0][1] - 1 ||
                    yPos == this.shipList[i].position[0][1] + 1)) ||
                (yPos == this.shipList[i].position[0][1] &&
                  (xPos == this.shipList[i].position[0][0] - 1 ||
                    xPos == this.shipList[i].position[0][0] + 1))
              ) {
                this.fillRectangle(xPos, yPos, this.colorGrayShip);
                this.shipList[i].position.push([xPos, yPos]);
                this.usedFields.push([xPos, yPos]);
                this.shipPartsAvailable--;
              }
            } else {
              if (
                this.shipList[i].position[0][0] ==
                this.shipList[i].position[1][0]
              ) {
                let tempYArray = [] as number[];
                this.shipList[i].position.forEach((pos) => {
                  tempYArray.push(pos[1]);
                });
                // console.log(tempYArray);
                const yMax = Math.max(...tempYArray);
                const yMin = Math.min(...tempYArray);

                if (
                  xPos == this.shipList[i].position[0][0] &&
                  (yPos == yMax + 1 || yPos == yMin - 1)
                ) {
                  this.fillRectangle(xPos, yPos, this.colorGrayShip);
                  this.shipList[i].position.push([xPos, yPos]);
                  this.usedFields.push([xPos, yPos]);
                  this.shipPartsAvailable--;
                }
              } else if (
                this.shipList[i].position[0][1] ==
                this.shipList[i].position[1][1]
              ) {
                let tempXArray = [] as number[];
                this.shipList[i].position.forEach((pos) => {
                  tempXArray.push(pos[0]);
                });
                // console.log(tempXArray);
                const xMax = Math.max(...tempXArray);
                const xMin = Math.min(...tempXArray);

                if (
                  yPos == this.shipList[i].position[0][1] &&
                  (xPos == xMax + 1 || xPos == xMin - 1)
                ) {
                  this.fillRectangle(xPos, yPos, this.colorGrayShip);
                  this.shipList[i].position.push([xPos, yPos]);
                  this.usedFields.push([xPos, yPos]);
                  this.shipPartsAvailable--;
                }
              }
            }
            // console.log("Pozostałe części " + this.shipPartsAvailable);
            if (this.shipPartsAvailable == 0) {
              // console.log("Koniec statku " + i);
              this.isPlacingShip = false;
              this.shipList[i].active = false;
              this.shipList[i].set = true;
              this.shipList[i].position.forEach((pos) => {
                this.fillRectangle(pos[0], pos[1], this.colorShip);
              });
              switch (i) {
                case 0: {
                  // console.log(i);
                  this.drawCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 1 * this.tileSize,
                    2,
                    1,
                    this.colorGrayGrid
                  );
                  this.fillCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 1 * this.tileSize,
                    2,
                    1,
                    this.colorGrayShip
                  );
                  break;
                }
                case 1: {
                  // console.log(i);
                  this.drawCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 3 * this.tileSize,
                    3,
                    1,
                    this.colorGrayGrid
                  );
                  this.fillCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 3 * this.tileSize,
                    3,
                    1,
                    this.colorGrayShip
                  );
                  break;
                }
                case 2: {
                  // console.log(i);
                  this.drawCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 5 * this.tileSize,
                    3,
                    1,
                    this.colorGrayGrid
                  );
                  this.fillCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 5 * this.tileSize,
                    3,
                    1,
                    this.colorGrayShip
                  );
                  break;
                }
                case 3: {
                  // console.log(i);
                  this.drawCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 7 * this.tileSize,
                    4,
                    1,
                    this.colorGrayGrid
                  );
                  this.fillCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 7 * this.tileSize,
                    4,
                    1,
                    this.colorGrayShip
                  );
                  break;
                }
                case 4: {
                  // console.log(i);
                  this.drawCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 9 * this.tileSize,
                    5,
                    1,
                    this.colorGrayGrid
                  );
                  this.fillCustomGrid(
                    this.yourBoardX + 12 * this.tileSize,
                    this.yourBoardY + 9 * this.tileSize,
                    5,
                    1,
                    this.colorGrayShip
                  );
                  break;
                }
              }
              break;
            }
            if (!this.isValid(this.shipList[i].position)) {
              this.resetShip(i);
              this.isPlacingShip = false;
              this.shipPartsAvailable = 0;
              alert("You can not place ship here");
              break;
            }
          } else {
            console.log(
              "Pole nie jest dostępne, pozostałe części " +
                this.shipPartsAvailable
            );
            break;
          }
        }
      }
    }
  }

  resetShip(shipNb: number) {
    switch (shipNb) {
      case 0: {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 1 * this.tileSize,
          2,
          1,
          this.colorGrayGrid
        );
        this.fillCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 1 * this.tileSize,
          2,
          1,
          this.colorShip
        );
        break;
      }
      case 1: {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 3 * this.tileSize,
          3,
          1,
          this.colorGrayGrid
        );
        this.fillCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 3 * this.tileSize,
          3,
          1,
          this.colorShip
        );
        break;
      }
      case 2: {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 5 * this.tileSize,
          3,
          1,
          this.colorGrayGrid
        );
        this.fillCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 5 * this.tileSize,
          3,
          1,
          this.colorShip
        );
        break;
      }
      case 3: {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 7 * this.tileSize,
          4,
          1,
          this.colorGrayGrid
        );
        this.fillCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 7 * this.tileSize,
          4,
          1,
          this.colorShip
        );
        break;
      }
      case 4: {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 9 * this.tileSize,
          5,
          1,
          this.colorGrayGrid
        );
        this.fillCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 9 * this.tileSize,
          5,
          1,
          this.colorShip
        );
        break;
      }
    }

    for (let i = 0; i < this.shipList[shipNb].position.length; i++) {
      this.fillRectangle(
        this.shipList[shipNb].position[i][0],
        this.shipList[shipNb].position[i][1],
        "white"
      );
      this.usedFields.pop();
    }
    // console.log(this.usedFields);
    this.shipList[shipNb].position = [];
    this.shipList[shipNb].active = false;
  }

  isValid(shipPos: number[][]) {
    // console.log("Validation ");
    if (shipPos.length == 1) {
      if (
        this.isEmptyField(shipPos[0][0] + 1, shipPos[0][1]) ||
        this.isEmptyField(shipPos[0][0] - 1, shipPos[0][1]) ||
        this.isEmptyField(shipPos[0][0], shipPos[0][1] + 1) ||
        this.isEmptyField(shipPos[0][0], shipPos[0][1] - 1)
      ) {
        return true;
      }
    } else if (shipPos.length > 1) {
      if (shipPos[0][0] == shipPos[1][0]) {
        // console.log("Statek w pionie");
        let tempXArray = [] as number[];
        shipPos.forEach((pos) => {
          tempXArray.push(pos[1]);
        });
        // console.log(tempXArray);
        const yMax = Math.max(...tempXArray);
        const yMin = Math.min(...tempXArray);
        // console.log(shipPos);
        // console.log("yMax: " + yMax + " yMin: " + yMin);
        if (
          this.isEmptyField(shipPos[0][0], yMax + 1) ||
          this.isEmptyField(shipPos[0][0], yMin - 1)
        ) {
          return true;
        }
      } else if (shipPos[0][1] == shipPos[1][1]) {
        let tempYArray = [] as number[];
        shipPos.forEach((pos) => {
          tempYArray.push(pos[0]);
        });
        // console.log(tempYArray);
        const xMax = Math.max(...tempYArray);
        const xMin = Math.min(...tempYArray);
        // console.log(shipPos);
        // console.log("xMax: " + xMax + " xMin: " + xMin);
        if (
          this.isEmptyField(xMax + 1, shipPos[0][1]) ||
          this.isEmptyField(xMin - 1, shipPos[0][1])
        ) {
          return true;
        }
      }
    }
    return false;
  }

  isEmptyField(xPos: number, yPos: number) {
    // console.log("Is empty point " + xPos + "," + yPos);
    for (let i = 0; i < this.usedFields.length; i++) {
      if (xPos == this.usedFields[i][0] && yPos == this.usedFields[i][1]) {
        // console.log(
        //   "In usedField-> Position X: " +
        //     xPos +
        //     " Y: " +
        //     yPos +
        //     " Valid: " +
        //     false
        // );
        return false;
      }
    }
    if (xPos < 0 || xPos > 9 || yPos < 0 || yPos > 9) {
      // console.log(
      //   "Za planszą -> Position X: " + xPos + " Y: " + yPos + " Valid: " + false
      // );
      return false;
    }
    // console.log("Position X: " + xPos + " Y: " + yPos + " Valid: " + true);
    return true;
  }

  checkIfShipClicked(xPos: number, yPos: number) {
    if (!this.isPlacingShip) {
      // console.log("position X: " + xPos + " Y: " + yPos);
      if ((xPos == 12 || xPos == 13) && yPos == 1) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 1 * this.tileSize,
          2,
          1,
          this.colorRed
        );
        this.shipPartsAvailable = 2;
        this.shipList[0].active = true;
        this.isPlacingShip = true;
      } else if (xPos > 11 && xPos < 15 && yPos == 3) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 3 * this.tileSize,
          3,
          1,
          this.colorRed
        );
        this.shipList[1].active = true;
        this.isPlacingShip = true;
        this.shipPartsAvailable = 3;
      } else if (xPos > 11 && xPos < 15 && yPos == 5) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 5 * this.tileSize,
          3,
          1,
          this.colorRed
        );
        this.shipList[2].active = true;
        this.shipPartsAvailable = 3;
        this.isPlacingShip = true;
      } else if (xPos > 11 && xPos < 16 && yPos == 7) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 7 * this.tileSize,
          4,
          1,
          this.colorRed
        );
        this.shipList[3].active = true;
        this.shipPartsAvailable = 4;
        this.isPlacingShip = true;
      } else if (xPos > 11 && xPos < 17 && yPos == 9) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 9 * this.tileSize,
          5,
          1,
          this.colorRed
        );
        this.shipList[4].active = true;
        this.shipPartsAvailable = 5;
        this.isPlacingShip = true;
      }
    }
  }

  drawBoard(xPos: number, yPos: number, title: string) {
    const lineWidth = 2;
    this.ctx.lineWidth = lineWidth;

    this.drawCustomGrid(xPos, yPos, 10, 10, this.colorGrayGrid);
    this.fillCustomGrid(xPos, yPos, 10, 10, "white");

    this.ctx.font = "25px Sitka";
    this.ctx.fillStyle = "white";
    const tmp = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const tmp2 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    this.ctx.textAlign = "center";
    for (let i = 0; i < 10; i++) {
      this.ctx.fillText(
        tmp[i],
        xPos + 21 + i * this.tileSize,
        yPos - (this.tileSize - 35)
      );
      this.ctx.fillText(
        tmp2[i],
        xPos - (this.tileSize - 25),
        yPos + 35 + i * this.tileSize
      );
    }
    this.ctx.font = "50px Sitka";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      title,
      xPos + 5 * this.tileSize,
      yPos - 1 * this.tileSize
    );
  }

  drawCustomGrid(
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    color: string
  ) {
    this.ctx.beginPath();
    const lineWidth = 2;
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    for (let i = 1; i <= xSize * this.tileSize + 1; i = i + this.tileSize) {
      this.ctx.moveTo(xPos + i, yPos);
      this.ctx.lineTo(xPos + i, yPos + ySize * this.tileSize + 2);
      this.ctx.stroke();
    }

    for (let j = 1; j <= ySize * this.tileSize + 1; j = j + this.tileSize) {
      this.ctx.moveTo(xPos, yPos + j);
      this.ctx.lineTo(xPos + xSize * this.tileSize + 2, yPos + j);
      this.ctx.stroke();
    }
    this.ctx.closePath();
  }

  drawShips(xPos: number, yPos: number) {
    // Ship 2x1
    this.drawCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 1 * this.tileSize,
      2,
      1,
      this.colorGrayGrid
    );
    this.fillCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 1 * this.tileSize,
      2,
      1,
      this.colorShip
    );
    // Ship 3x1
    this.drawCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 3 * this.tileSize,
      3,
      1,
      this.colorGrayGrid
    );
    this.fillCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 3 * this.tileSize,
      3,
      1,
      this.colorShip
    );
    // Ship 3x1
    this.drawCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 5 * this.tileSize,
      3,
      1,
      this.colorGrayGrid
    );
    this.fillCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 5 * this.tileSize,
      3,
      1,
      this.colorShip
    );
    // Ship 4x1
    this.drawCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 7 * this.tileSize,
      4,
      1,
      this.colorGrayGrid
    );
    this.fillCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 7 * this.tileSize,
      4,
      1,
      this.colorShip
    );
    // Ship 5x1
    this.drawCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 9 * this.tileSize,
      5,
      1,
      this.colorGrayGrid
    );
    this.fillCustomGrid(
      xPos + 12 * this.tileSize,
      yPos + 9 * this.tileSize,
      5,
      1,
      this.colorShip
    );
  }

  fillCustomGrid(
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    color: string
  ) {
    this.ctx.fillStyle = color;
    for (let i = 0; i < xSize; i++) {
      for (let j = 0; j < ySize; j++) {
        this.ctx.fillRect(
          xPos + i * this.tileSize + 2,
          yPos + j * this.tileSize + 2,
          40,
          40
        );
      }
    }
  }

  // Funkcja odpowiedzialna za pokolorowanie pola po trafieniu == 1 / nietrafieniu == 0
  fillHit(xPos: number, yPos: number, isHit: number) {
    if (isHit == 1) {
      this.fillRectangle(xPos, yPos, this.colorRed);
      this.ctx.drawImage(
        this.lightningImg,
        xPos * this.tileSize + 12 + this.yourBoardX,
        yPos * this.tileSize + 12 + this.yourBoardY
      );
    } else if (isHit == 0) {
      // console.log("Draw circle");
      this.ctx.beginPath();
      this.ctx.arc(
        (xPos + 0.5) * this.tileSize + this.yourBoardX,
        (yPos + 0.5) * this.tileSize + this.yourBoardY,
        7.5,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = "black";
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  fillRectangle(xPos: number, yPos: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      xPos * this.tileSize + 2 + this.yourBoardX,
      yPos * this.tileSize + 2 + this.yourBoardY,
      40,
      40
    );
  }
}
