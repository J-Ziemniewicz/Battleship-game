import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { PlayerGuard } from "./player.guard";

describe("PlayerGuard", () => {
  let guard: PlayerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RouterTestingModule] });
    guard = TestBed.inject(PlayerGuard);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });
});
