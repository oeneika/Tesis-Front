import {EventEmitter, Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  events = ['new-user', 'bye-user', 'message'];
  cbEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private Socket: Socket) {
    this.listener();
  }

  listener = () => {
    this.events.forEach(evenName => {
      this.Socket.on(evenName, data => this.cbEvent.emit({
        name: evenName,
        data
      }));
    });
  };

  leaveRoom = (data) => {
    console.log("saliendo del cuarto", data);
    this.Socket.emit('leave', data);
  }
  joinRoom = (data) => {
    console.log("uniendose al cuarto", data);
    this.Socket.emit('join', data);
  }
  notifyRoom = (data) => {
    console.log("notificando al cuarto", data);
    this.Socket.emit('message', data);
  }
}
