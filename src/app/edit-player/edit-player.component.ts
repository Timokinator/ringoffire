import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.scss']
})
export class EditPlayerComponent {

  allProfilePictures = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];


  constructor (public dialogRef: MatDialogRef<EditPlayerComponent>) { }




}
