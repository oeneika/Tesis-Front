import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { freeSet } from '@coreui/icons';
import { SwPush } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { WebSocketService } from './services/web-socket.service';
import { CamerasService } from './services/cameras.service';
import { take } from 'rxjs/operators';
import { UserService } from './services/user.service';
import { NotificationService } from './services/notifications.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  templateUrl: './app.component.html',
  providers: [IconSetService],
})
export class AppComponent implements OnInit {

  public subscriptions: Subscription[] = [];
  public cameras: any[] = [];
  public swPush: any;
  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private userService: UserService,
    private _cameraService: CamerasService,
    private notificationService: NotificationService,
    public iconSet: IconSetService,
  ) {
    // iconSet singleton
    iconSet.icons = { ...freeSet };
  }

  ngOnInit() {

    this.swPush = JSON.parse(localStorage.getItem('swPush'));
    this.initSocket();
    this.getCamerasByUser();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // this.webSocketService.disconnect();
  }

  initSocket = () => {
    this.subscriptions.push(this.webSocketService.cbEvent.subscribe((res) => {
      if (res.name === 'push' && res.data.identity === this.userService.identity) {
        this.notificationService.sendNotificationsPush(this.swPush).subscribe((res: any)=> {});
        console.log('Push enviada perro');
      }
    }));
  };

  /**
   * getCamerasByUser
   */
   public getCamerasByUser() {
    this._cameraService.getCamerasByUser().pipe(take(1)).subscribe((response: any) => {
      this.cameras = response;
      response.forEach(element => {
        this.webSocketService.getRooms({cameraId: element?.cameraId?._id, joinRoom: true});
      });
    });
  }
}
