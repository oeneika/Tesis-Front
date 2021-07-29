import {Injectable} from '@angular/core';
import Peer from 'peerjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer: any;

  constructor() {
    this.peer = new Peer(undefined, {
      host: environment.peerjsHost,
      port: environment.peerJSPort,
      secure: false
    });
  }
}
