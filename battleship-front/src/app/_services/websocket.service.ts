import { Injectable } from "@angular/core";
import { Observable, Subject, Observer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  constructor() {}

  private subject: Subject<MessageEvent>;

  public connect(url): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("successfully Connect: " + url);
    }
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
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
}
