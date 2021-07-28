import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-app-video-player',
  templateUrl: './app-video-player.component.html',
  styleUrls: ['./app-video-player.component.scss']
})
export class AppVideoPlayerComponent implements OnInit {
  @Input() stream: any;
  constructor() { }

  ngOnInit(): void {
  }

}
