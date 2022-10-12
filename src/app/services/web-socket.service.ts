import {EventEmitter, Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  events = ['new-user', 'bye-user', 'message', 'retrieve-rooms', 'push'];
  cbEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _socket: Socket) {
    this.listener();
  }

  listener = () => {
    this.events.forEach(evenName => {
      this._socket.on(evenName, data => {this.cbEvent.emit({
        name: evenName,
        data
      }); //console.log('vent', evenName, data)
    });
    });
  };

  getRooms = (data) => {
    return this._socket.emit('get-rooms', data);
  };

  leaveRoom = (data) => {
    console.log("saliendo del cuarto", data);
    this._socket.emit('leave', data);
  }
  joinRoom = (data) => {
    console.log("uniendose al cuarto", data);
    this._socket.emit('join', data);
  }
  pushRoom = (data) => {
    console.log("emitiendo push al cuarto", data);
    this._socket.emit('push', data);
  }
  notifyRoom = (data) => {
    console.log("notificando al cuarto", data);
    this._socket.emit('message', data);
  }
  disconnect() {
    console.log('desconectando socket');
    this._socket.disconnect();
  }
}
