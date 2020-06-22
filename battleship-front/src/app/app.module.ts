import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { StartGameComponent } from './start-game/start-game.component';
import { JoinGameComponent } from './join-game/join-game.component';
import { CreateGameComponent } from './create-game/create-game.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    StartGameComponent,
    JoinGameComponent,
    CreateGameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
