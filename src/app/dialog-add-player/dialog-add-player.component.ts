import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-add-player',
  templateUrl: './dialog-add-player.component.html',
  styleUrls: ['./dialog-add-player.component.scss']
})
export class DialogAddPlayerComponent implements OnInit {

  @Input()

  name: string = '';

ngOnInit(): void {
  
}


onNoClick() {

}

}
