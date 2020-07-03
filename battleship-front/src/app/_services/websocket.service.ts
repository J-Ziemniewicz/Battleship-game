import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, Observer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  constructor() {
    if (sessionStorage.getItem("playerId") !== null) {
      this.connId = parseInt(sessionStorage.getItem("playerId"), 10);
    }
  }

  private connId: number = 0;
  private subject: Subject<MessageEvent>;

  public connect(url): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      // console.log("successfully Connect: " + url);
    }
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      ws.onclose = () => {
        // console.log("trying to reconnect");
        this.subject = null;
        this.connect(url);
      };
      return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          let jsonStr = JSON.stringify(data);
          let blob = new Blob([jsonStr], { type: "application/json" });
          ws.send(blob);
        }
      },
    };
    return Subject.create(observer, observable);
  }

  public setConnId(id: number) {
    this.connId = id;
    // console.log("addidng player Id " + this.connId);
    sessionStorage.setItem("playerId", id.toString());
  }

  public getConnId() {
    // console.log("Player ID in websocketService " + this.connId);
    return this.connId;
  }
}
