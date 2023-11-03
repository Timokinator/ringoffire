import { Component, OnInit, Input } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Injectable, inject } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


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



  constructor(private route: ActivatedRoute, public dialog: MatDialog, private router: Router) {
    this.unsubGames = this.subGamesList();
    this.routeId = this.route.params['_value']['id'];
    //this.unsubSingleGame = 

  }


  setIdSingleGame(routeId) {
    this.unsubSingleGame = onSnapshot(doc(this.getGamesRef(), routeId), (doc) => {
      console.log("Current data: ", doc.data());
      this.game.currentPlayer = doc.data()['currentPlayer'];
      this.game.players = doc.data()['players'];
      this.game.playedCards = doc.data()['playedCards'];
      this.game.stack = doc.data()['stack'];
      this.setCurrentCard();
    });
  }


  setCurrentCard() {
    if (this.game.playedCards.length > 0) {
      this.currentCard = this.game.playedCards[this.game.playedCards.length - 1]
    }
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
    let message = prompt("Enter password for delete all games:")

    if (message == "12345") {
      for (let i = 0; i < this.allGameIds.length; i++) {
        const element = this.allGameIds[i];
        await deleteDoc(doc(this.getGamesRef(), element));
      };
      this.startNewGame();
    }
  }


  /*  async saveGameToFirebase(game) {
     await addDoc(this.getGamesRef(), game).then(docRef => {
       console.log("Document written with ID: ", docRef.id);
     })
   } */

  ngonDestroy() {
    this.unsubGames;
    this.unsubSingleGame;
  }


  ngOnInit(): void {
    this.newGame();
    this.setIdSingleGame(this.routeId);
    this.game.id = this.routeId;
    console.log(this.routeId);
    //this.saveGameToFirebase(this.game.toJson(this.routeId));
    this.saveGame(this.game);

  }


  async newGame() {
    this.game = new Game();
  }


  async startNewGame() {
    console.log('new game')
    this.game = new Game;
    await addDoc(collection(this.firestore, 'games'), this.game.toJson('')).then(docRef => {
      console.log("Document written with ID: ", docRef.id);
      this.routeId = docRef.id;
    })
    this.router.navigateByUrl(`/game/${this.routeId}`);
    this.ngOnInit()

    //this.setIdSingleGame(this.routeId);

  }


  takeCard() {
    if (!this.pickCardAnimation && this.game.players.length > 0) {
      this.currentCard = this.game.stack.pop();
      //console.log(this.currentCard);
      this.pickCardAnimation = true;

      if (Number.isNaN(this.game.currentPlayer) || this.game.currentPlayer > this.game.players.length) {
        this.game.currentPlayer = 0;
      }

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
      id: this.routeId
    }
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        this.game.players.push(name);
        this.saveGame(this.game);
      }
    });
  }






}
