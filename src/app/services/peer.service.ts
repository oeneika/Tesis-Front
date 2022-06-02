import {Injectable} from '@angular/core';
import Peer from 'peerjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer: any;

  constructor() {
    this.peer = new Peer('tesis-' + String(JSON.parse(localStorage.getItem('idCamera'))), {
      host: environment.peerjsHost,
      port: environment.peerJSPort,
      path: '/peerjs',
      secure: false
    });
  }
}
