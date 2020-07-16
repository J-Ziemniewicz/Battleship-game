import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BoardComponent } from "./board/board.component";
import { MenuComponent } from "./menu/menu.component";
import { PlayerGuard } from "./_guards/player.guard";

const routes: Routes = [
  {
    path: "",
    component: MenuComponent,
  },
  {
    path: "battle",
    redirectTo: "",
    pathMatch: "full",
    canActivate: [PlayerGuard],
  },
  {
    path: "battle/:id",
    component: BoardComponent,
    canActivate: [PlayerGuard],
  },
  { path: "**", component: MenuComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes /*, { useHash: true }*/)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
