import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Injectable, inject } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  game: Game;
  currentCard: string = '';
  firestore: Firestore = inject(Firestore);
  unsubGames;





  constructor(public dialog: MatDialog) {
    this.unsubGames = this.subGamesList();



  }


  getGamesRef() {
    return collection(this.firestore, 'games');
  }

  subGamesList() {
    const q = query(this.getGamesRef(), limit(100));
    return onSnapshot(q, (list) => {
      //this.normalNotes = [];
      list.forEach(element => {
        // console.log(element.data());
      });
    });
  }


  async saveGameToFirebase(game) {
    await addDoc(this.getGamesRef(), game);
  }



  ngonDestroy() {
    this.unsubGames;
  }


  ngOnInit(): void {
    this.newGame();
  }

  newGame() {
    this.game = new Game();
    this.saveGameToFirebase(this.game.toJson());
  }


  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop();
      //console.log(this.currentCard);
      this.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        this.pickCardAnimation = false;
        this.game.playedCards.push(this.currentCard)
      }, 1300);
    }
  };

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        this.game.players.push(name);
      }
    });
  }






}
