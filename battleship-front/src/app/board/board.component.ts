import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";

export interface Ship {
  active: boolean;
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
  private colorHitShip: string = "#d1495b";
  private colorGrayShip: string = "#a5a4a4";
  private colorGrayGrid: string = "#707070";
  private colorRedGrid: string = "#d1495B";

  private shipList: Ship[] = [];
  private shipPartsAvailable: number;
  private isPlacingShip: boolean = false;
  private usedFields: number[][] = [];

  ngOnInit(): void {
    this.canvas.nativeElement.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
    this.ctx = this.canvas.nativeElement.getContext("2d");
    // this.canvas.nativeElement.onselectionchange = function () {
    //   return false;
    // };
    for (let i = 0; i < 5; i++) {
      let tempShip = {} as Ship;
      tempShip.active = false;
      tempShip.position = [];
      this.shipList.push(tempShip);
    }

    this.drawBoard(this.yourBoardX, this.yourBoardY, "YOU");
    // this.drawBoard(
    //   this.yourBoardX + 13 * this.tileSize,
    //   this.yourBoardY,
    //   "ENEMY"
    // );
    this.drawShips(this.yourBoardX, this.yourBoardY);
  }

  ready() {
    console.log("Game ready: " + this.gameReady);
    this.gameReady = true;
    this.canvas.nativeElement.width = 1008;
    this.drawBoard(this.yourBoardX, this.yourBoardY, "YOU");
    this.redrawPlacedShips();
    this.drawBoard(
      this.yourBoardX + 13 * this.tileSize,
      this.yourBoardY,
      "ENEMY"
    );
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

    console.log("\n" + (posx + 1) + " " + (posy + 1));
    this.checkIfShipClicked(posx, posy);
    // console.log(this.isPlacingShip);
    if (this.isPlacingShip) {
      if (posx < 10 && posy < 10) {
        this.placeShip(posx, posy);
      }
    }
  }

  placeShip(xPos: number, yPos: number) {
    console.log("Dostępne elementy łodzi " + this.shipPartsAvailable);
    if (this.shipPartsAvailable > 0) {
      // console.log(this.shipList.length);
      for (let i = 0; i < this.shipList.length; i++) {
        if (this.shipList[i].active) {
          console.log("Statek jest aktywny: " + i);
          // console.log("Pole jest wolne " + this.isEmptyField(xPos, yPos));
          if (this.isEmptyField(xPos, yPos)) {
            let len = this.shipList[i].position.length;
            console.log("Długość list statku " + i + " : " + len);
            if (len == 0) {
              this.fillRectangle(xPos, yPos, this.colorGrayShip);
              this.shipList[i].position.push([xPos, yPos]);
              this.usedFields.push([xPos, yPos]);
              // console.log(
              //   "Ship: " + i + " position " + this.shipList[i].position
              // );
              // console.log("used fields " + this.usedFields);
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
                // console.log(
                //   "Ship: " + i + " position" + this.shipList[i].position
                // );
                // console.log("used fields " + this.usedFields);
                this.shipPartsAvailable--;
              }
            } else {
              if (
                this.shipList[i].position[0][0] ==
                this.shipList[i].position[1][0]
              ) {
                // console.log(
                //   "W pionie " +
                //     (xPos == this.shipList[i].position[0][0] &&
                //       (yPos == this.shipList[i].position[0][1] - 1 ||
                //         yPos == this.shipList[i].position[0][1] + 1 ||
                //         yPos == this.shipList[i].position[len - 1][1] + 1 ||
                //         yPos == this.shipList[i].position[len - 1][1] - 1))
                // );
                let tempYArray = [] as number[];
                this.shipList[i].position.forEach((pos) => {
                  tempYArray.push(pos[1]);
                });
                console.log(tempYArray);
                const yMax = Math.max(...tempYArray);
                const yMin = Math.min(...tempYArray);

                if (
                  xPos == this.shipList[i].position[0][0] &&
                  (yPos == yMax + 1 || yPos == yMin - 1)
                ) {
                  this.fillRectangle(xPos, yPos, this.colorGrayShip);
                  this.shipList[i].position.push([xPos, yPos]);
                  this.usedFields.push([xPos, yPos]);
                  // console.log(
                  //   "Ship: " + i + " position" + this.shipList[i].position
                  // );
                  // console.log("used fields " + this.usedFields);
                  this.shipPartsAvailable--;
                }
              } else if (
                this.shipList[i].position[0][1] ==
                this.shipList[i].position[1][1]
              ) {
                // console.log(
                //   "W poziomie " +
                //     (yPos == this.shipList[i].position[0][1] &&
                //       (xPos == this.shipList[i].position[0][0] - 1 ||
                //         xPos == this.shipList[i].position[0][0] + 1 ||
                //         xPos == this.shipList[i].position[len - 1][0] + 1 ||
                //         xPos == this.shipList[i].position[len - 1][0] - 1))
                // );
                let tempXArray = [] as number[];
                this.shipList[i].position.forEach((pos) => {
                  tempXArray.push(pos[0]);
                });
                console.log(tempXArray);
                const xMax = Math.max(...tempXArray);
                const xMin = Math.min(...tempXArray);

                if (
                  yPos == this.shipList[i].position[0][1] &&
                  (xPos == xMax + 1 || xPos == xMin - 1)
                ) {
                  this.fillRectangle(xPos, yPos, this.colorGrayShip);
                  this.shipList[i].position.push([xPos, yPos]);
                  this.usedFields.push([xPos, yPos]);
                  // console.log(
                  //   "Ship: " + i + " position" + this.shipList[i].position
                  // );
                  // console.log("used fields " + this.usedFields);
                  this.shipPartsAvailable--;
                }
              }
            }
            console.log("Pozostałe części " + this.shipPartsAvailable);
            if (this.shipPartsAvailable == 0) {
              console.log("Koniec statku " + i);
              this.isPlacingShip = false;
              this.shipList[i].active = false;
              this.shipList[i].position.forEach((pos) => {
                this.fillRectangle(pos[0], pos[1], this.colorShip);
              });
              switch (i) {
                case 0: {
                  console.log(i);
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
                  console.log(i);
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
                  console.log(i);
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
                  console.log(i);
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
                  console.log(i);
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
            // console.log("Is Valid: " + this.isValid(this.shipList[i].position));
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
    console.log("Validation ");
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
        console.log("Statek w pionie");
        let tempXArray = [] as number[];
        shipPos.forEach((pos) => {
          tempXArray.push(pos[1]);
        });
        console.log(tempXArray);
        const yMax = Math.max(...tempXArray);
        const yMin = Math.min(...tempXArray);
        console.log(shipPos);
        console.log("yMax: " + yMax + " yMin: " + yMin);
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
        console.log(tempYArray);
        const xMax = Math.max(...tempYArray);
        const xMin = Math.min(...tempYArray);
        console.log(shipPos);
        console.log("xMax: " + xMax + " xMin: " + xMin);
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
    console.log("Is empty point " + xPos + "," + yPos);
    for (let i = 0; i < this.usedFields.length; i++) {
      if (xPos == this.usedFields[i][0] && yPos == this.usedFields[i][1]) {
        console.log(
          "In usedField-> Position X: " +
            xPos +
            " Y: " +
            yPos +
            " Valid: " +
            false
        );
        return false;
      }
    }
    if (xPos < 0 || xPos > 9 || yPos < 0 || yPos > 9) {
      console.log(
        "Za planszą -> Position X: " + xPos + " Y: " + yPos + " Valid: " + false
      );
      return false;
    }
    console.log("Position X: " + xPos + " Y: " + yPos + " Valid: " + true);
    return true;
  }

  checkIfShipClicked(xPos: number, yPos: number) {
    if (!this.isPlacingShip) {
      console.log("position X: " + xPos + " Y: " + yPos);
      if ((xPos == 12 || xPos == 13) && yPos == 1) {
        this.drawCustomGrid(
          this.yourBoardX + 12 * this.tileSize,
          this.yourBoardY + 1 * this.tileSize,
          2,
          1,
          this.colorRedGrid
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
          this.colorRedGrid
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
          this.colorRedGrid
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
          this.colorRedGrid
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
          this.colorRedGrid
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

  fillCustomGrid(
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    color: string
  ) {
    // console.log("fillGrid");
    this.ctx.fillStyle = color;
    for (let i = 0; i < xSize; i++) {
      for (let j = 0; j < ySize; j++) {
        this.ctx.fillRect(
          xPos + i * this.tileSize + 2, //+ this.yourBoardX,
          yPos + j * this.tileSize + 2, // + this.yourBoardY,
          40,
          40
        );
      }
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
}

// export class Grid {
//   constructor(private ctx: CanvasRenderingContext2D) {}

//   drawGrid() {
//     this.ctx.lineWidth = 2;

//     // this.ctx.moveTo(1, 0);
//     // this.ctx.lineTo(1, 421);
//     // this.ctx.stroke();

//     this.ctx.moveTo(421, 0);
//     this.ctx.lineTo(421, 422);
//     this.ctx.stroke();

//     // this.ctx.moveTo(0, 1);
//     // this.ctx.lineTo(421, 0);
//     // this.ctx.stroke();

//     this.ctx.moveTo(0, 421);
//     this.ctx.lineTo(422, 421);
//     this.ctx.stroke();

//     for (let i = 1; i < 422; i = i + 42) {
//       this.ctx.moveTo(i, 0);
//       this.ctx.lineTo(i, 422);
//       this.ctx.stroke();
//     }

//     for (let j = 1; j < 422; j = j + 42) {
//       this.ctx.moveTo(0, j);
//       this.ctx.lineTo(422, j);
//       this.ctx.stroke();
//     }

//     this.ctx.fillStyle = "red";
//     this.ctx.fillRect(2, 2, 40, 40);
//   }
// }
