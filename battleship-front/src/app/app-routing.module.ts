import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BoardComponent } from "./board/board.component";
import { StartGameComponent } from "./start-game/start-game.component";
import { CreateGameComponent } from "./create-game/create-game.component";
import { JoinGameComponent } from "./join-game/join-game.component";

const routes: Routes = [
  {
    path: "",
    component: StartGameComponent,
  },
  {
    path: "battle",
    component: BoardComponent,
  },
  {
    path: "create_game",
    component: CreateGameComponent,
  },
  {
    path: "join_game",
    component: JoinGameComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
