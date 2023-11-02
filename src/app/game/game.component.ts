import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Injectable, inject } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';


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

  private activatedRoute = inject(ActivatedRoute);
  testId = this.activatedRoute.snapshot.params['game/:id'];

  unsubGames;
  unsubSingleGame;
  routeId;
  allGameIds = [];


  constructor(private route: ActivatedRoute, public dialog: MatDialog) {
    this.unsubGames = this.subGamesList();
    this.routeId = this.route.params['_value']['id'];
    //this.unsubSingleGame = 

  }



  setIdSingleGame(routeId) {
    this.unsubSingleGame = onSnapshot(doc(this.getGamesRef(), routeId), (doc) => {
      console.log("Current data: ", doc.data());
    });
  }


  getGamesRef() {
    return collection(this.firestore, 'games');
  }

  subGamesList() {
    const q = query(this.getGamesRef(), limit(100));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        if (!this.allGameIds.includes(element.id)) {
          this.allGameIds.push(element.id);
        }
        //console.log(this.allGameIds)
      });
    });
  }



  getSingleGameRef(colId, docId) {
    return doc(collection(this.firestore, colId), docId);
  }

  async deleteGames() {
    for (let i = 0; i < this.allGameIds.length; i++) {
      const element = this.allGameIds[i];
      await deleteDoc(doc(this.getGamesRef(), element));
    };
  }


  async saveGameToFirebase(game) {
    await addDoc(this.getGamesRef(), game);
  }

  ngonDestroy() {
    this.unsubGames;
    this.unsubSingleGame;
  }


  ngOnInit(): void {
    this.newGame();
    this.saveGameToFirebase(this.game.toJson(this.routeId));
    this.setIdSingleGame(this.routeId);
    this.game.id = this.routeId;
    console.log(this.routeId);

  }

  async newGame() {
    this.game = new Game();
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
        this.game.playedCards.push(this.currentCard);
        this.saveGame(this.game);

      }, 1300);
    }


  };


  async saveGame(game) {
    let docRef = doc(this.getGamesRef(), this.routeId);
    await updateDoc(docRef, this.getCleanJson(game)).catch(
      (err) => { console.log(err); }
    ).then(
      () => { console.log("Update") }
    );
  }


  getCleanJson(game: Game): {} {
    return {
      players: game.players,
      stack: game.stack,
      playedCards: game.playedCards,
      currentPlayer: game.currentPlayer,
      //id: this.routeId
    }
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        this.game.players.push(name);
      }
    });
  }






}
