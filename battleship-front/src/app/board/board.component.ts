import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"],
})
export class BoardComponent implements OnInit {
  @ViewChild("canvas", { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  private tileSize: number = 42;
  private ctx: CanvasRenderingContext2D;
  private yourBoardX: number = 0;
  private yourBoardY: number = 0;
  private colorShip: string = "#edae49";
  private colorHitShip: string = "#d1495b";

  ngOnInit(): void {
    this.canvas.nativeElement.addEventListener(
      "click",
      this.handleClick.bind(this)
    );
    this.ctx = this.canvas.nativeElement.getContext("2d");

    this.drawBoard(this.yourBoardX, this.yourBoardY);
    this.drawBoard(13 * this.tileSize, 0);
    this.drawShips(this.yourBoardX, this.yourBoardY);
  }

  getMousePos(event) {
    let rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left - this.yourBoardX;
    const y = event.clientY - rect.top - this.yourBoardY;
    const xPos = Math.floor((x - 1) / this.tileSize);
    const yPos = Math.floor((y - 1) / this.tileSize);
    console.log("Pixel position: x -> " + x + " y -> " + y);
    return {
      xPos,
      yPos,
    };
  }

  handleClick(event) {
    let pos = this.getMousePos(event);
    const posx = pos.xPos;
    const posy = pos.yPos;

    console.log(posx + 1 + " " + (posy + 1));
    if (posx < 10 && posy < 10) {
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(
        posx * this.tileSize + 2 + this.yourBoardX,
        posy * this.tileSize + 2 + this.yourBoardY,
        40,
        40
      );
    }
  }

  drawBoard(x: number, y: number) {
    const lineWidth = 2;
    this.ctx.lineWidth = lineWidth;
    const boardSize = 10 * this.tileSize + lineWidth;

    this.ctx.moveTo(x + boardSize - lineWidth / 2, y);
    this.ctx.lineTo(x + boardSize - lineWidth / 2, y + boardSize);
    this.ctx.stroke();

    this.ctx.moveTo(x, y + boardSize - lineWidth / 2);
    this.ctx.lineTo(
      x + boardSize - lineWidth / 2,
      y + boardSize - lineWidth / 2
    );
    this.ctx.stroke();

    for (let i = 1; i < boardSize; i = i + this.tileSize) {
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i, y + boardSize);
      this.ctx.stroke();
    }

    for (let j = 1; j < boardSize; j = j + this.tileSize) {
      this.ctx.moveTo(x, y + j);
      this.ctx.lineTo(x + boardSize, y + j);
      this.ctx.stroke();
    }
  }

  drawCustomGrid(xPos: number, yPos: number, xSize: number, ySize: number) {
    const lineWidth = 2;
    this.ctx.lineWidth = lineWidth;
    console.log(xSize * this.tileSize);
    for (let i = 1; i <= xSize * this.tileSize + 1; i = i + this.tileSize) {
      // console.log("print " + i);
      this.ctx.moveTo(xPos + i, yPos);
      this.ctx.lineTo(xPos + i, yPos + ySize * this.tileSize + 2);
      this.ctx.stroke();
    }

    for (let j = 1; j <= ySize * this.tileSize + 1; j = j + this.tileSize) {
      this.ctx.moveTo(xPos, yPos + j);
      // console.log("print " + j);
      this.ctx.lineTo(xPos + xSize * this.tileSize + 2, yPos + j);
      this.ctx.stroke();
    }
  }

  fillCustomGrid(
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    color: string
  ) {
    console.log("fillGrid");
    this.ctx.fillStyle = color;
    for (let i = 0; i < xSize; i++) {
      for (let j = 0; j < ySize; j++) {
        this.ctx.fillRect(
          xPos + i * this.tileSize + 2 + this.yourBoardX,
          yPos + j * this.tileSize + 2 + this.yourBoardY,
          40,
          40
        );
      }
    }
  }

  drawShips(x: number, y: number) {
    // Ship 2x1
    this.drawCustomGrid(x, y + 11 * this.tileSize, 2, 1);
    this.fillCustomGrid(x, y + 11 * this.tileSize, 2, 1, this.colorShip);
    // Ship 3x1
    this.drawCustomGrid(x + 3 * this.tileSize, y + 11 * this.tileSize, 3, 1);
    this.fillCustomGrid(
      x + 3 * this.tileSize,
      y + 11 * this.tileSize,
      3,
      1,
      this.colorShip
    );
    // Ship 3x1
    this.drawCustomGrid(x + 7 * this.tileSize, y + 11 * this.tileSize, 3, 1);
    this.fillCustomGrid(
      x + 7 * this.tileSize,
      y + 11 * this.tileSize,
      3,
      1,
      this.colorShip
    );
    // Ship 4x1
    this.drawCustomGrid(x, y + 13 * this.tileSize, 4, 1);
    this.fillCustomGrid(x, y + 13 * this.tileSize, 4, 1, this.colorShip);
    // Ship 5x1
    this.drawCustomGrid(x + 5 * this.tileSize, y + 13 * this.tileSize, 5, 1);
    this.fillCustomGrid(
      x + 5 * this.tileSize,
      y + 13 * this.tileSize,
      5,
      1,
      this.colorShip
    );
  }

  animate(): void {}
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
