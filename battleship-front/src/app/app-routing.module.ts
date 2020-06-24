import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BoardComponent } from "./board/board.component";
import { MenuComponent } from "./menu/menu.component";

const routes: Routes = [
  {
    path: "",
    component: MenuComponent,
  },
  {
    path: "battle/:id",
    component: BoardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
