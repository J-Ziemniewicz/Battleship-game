import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
  private chooseGame: Boolean = false;

  // @ViewChild("logo", { static: false }) gameLogo: ElementRef;

  constructor() {}

  ngOnInit() {}

  startGame() {
    this.chooseGame = true;
    // this.gameLogo.nativeElement.offsetHeight = "200px";
  }
}
