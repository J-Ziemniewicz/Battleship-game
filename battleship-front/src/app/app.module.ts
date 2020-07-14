import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BoardComponent } from "./board/board.component";
import { MenuComponent } from "./menu/menu.component";
import { WebsocketService } from "./_services/websocket.service";
import { MatDialogModule } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { WaitingDialogComponent } from "./dialogs/waiting-dialog/waiting-dialog.component";
import { EndDialogComponent } from "./dialogs/end-dialog/end-dialog.component";
import { NgBootstrapAlertModule } from "ng-bootstrap-alert";
import { ShipSunkComponent } from './dialogs/ship-sunk/ship-sunk.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    MenuComponent,
    WaitingDialogComponent,
    EndDialogComponent,
    ShipSunkComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    BrowserAnimationsModule,
    NgBootstrapAlertModule,
  ],
  entryComponents: [WaitingDialogComponent],
  providers: [WebsocketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
