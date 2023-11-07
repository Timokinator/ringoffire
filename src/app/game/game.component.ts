import { Component, OnInit, Input } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Injectable, inject } from '@angular/core';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { EditPlayerComponent } from '../edit-player/edit-player.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game: Game;
  firestore: Firestore = inject(Firestore);

  private activatedRoute = inject(ActivatedRoute);
  testId = this.activatedRoute.snapshot.params['game/:id'];

  unsubGames;
  unsubSingleGame;
  routeId;
  allGameIds = [];
  gameOver: boolean = false;


  constructor(private route: ActivatedRoute, public dialog: MatDialog, private router: Router) {
    this.unsubGames = this.subGamesList();
    this.routeId = this.route.params['_value']['id'];
  };


  setIdSingleGame(routeId) {
    this.unsubSingleGame = onSnapshot(doc(this.getGamesRef(), routeId), (doc) => {
      console.log("Current data: ", doc.data());
      this.game.currentPlayer = doc.data()['currentPlayer'];
      this.game.players = doc.data()['players'];
      this.game.player_images = doc.data()['player_images'];
      this.game.playedCards = doc.data()['playedCards'];
      this.game.stack = doc.data()['stack'];
      this.game.currentCard = doc.data()['currentCard'];
      this.game.pickCardAnimation = doc.data()['pickCardAnimation'];
      this.game.id = doc.data()['id'];
      //this.setCurrentCard();
    });
  };


  setCurrentCard() {
    if (this.game.playedCards.length > 0) {
      this.game.currentCard = this.game.playedCards[this.game.playedCards.length - 1]
    };
  };


  getGamesRef() {
    return collection(this.firestore, 'games');
  };


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
  };


  getSingleGameRef(colId, docId) {
    return doc(collection(this.firestore, colId), docId);
  };


  async deleteGames() {
    let message = prompt("Enter password for delete all games:")

    if (message == "12345") {
      for (let i = 0; i < this.allGameIds.length; i++) {
        const element = this.allGameIds[i];
        await deleteDoc(doc(this.getGamesRef(), element));
      };
      this.startNewGame();
    };
  };


  ngonDestroy() {
    this.unsubGames;
    this.unsubSingleGame;
  };


  ngOnInit(): void {
    this.newGame();
    this.setIdSingleGame(this.routeId);
    this.game.id = this.routeId;
    console.log(this.routeId);
  };


  async newGame() {
    this.game = new Game();
  };


  async startNewGame() {
    console.log('new game')
    this.game = new Game;
    await addDoc(collection(this.firestore, 'games'), this.game.toJson('')).then(docRef => {
      console.log("Document written with ID: ", docRef.id);
      this.routeId = docRef.id;
    })
    this.router.navigateByUrl(`/game/${this.routeId}`);
    this.ngOnInit();
  };


  takeCard() {
    if (this.game.stack.length == 0) {
      this.gameOver = true;
    } else if (!this.game.pickCardAnimation) {
      if (this.game.players.length > 0) {
        this.game.currentCard = this.game.stack.pop();
        this.game.pickCardAnimation = true;

        if (Number.isNaN(this.game.currentPlayer) || this.game.currentPlayer > this.game.players.length) {
          this.game.currentPlayer = 0;
        };

        this.game.currentPlayer++;
        this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
        this.saveGame(this.game);

        setTimeout(() => {
          this.game.pickCardAnimation = false;
          this.game.playedCards.push(this.game.currentCard);
          this.saveGame(this.game);
        }, 1300);
      } else {
        alert('Please add at least one player!')
      };
    };
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
      player_images: game.player_images,
      stack: game.stack,
      playedCards: game.playedCards,
      currentPlayer: game.currentPlayer,
      id: this.routeId,
      currentCard: game.currentCard,
      pickCardAnimation: game.pickCardAnimation
    }
  }



  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name) {
        this.game.players.push(name);
        this.game.player_images.push('1');
        this.saveGame(this.game);
      }
    });
  }


  editPlayer(playerId: number) {
    console.log(playerId)

    const dialogRef = this.dialog.open(EditPlayerComponent);

    dialogRef.afterClosed().subscribe((change: string) => {
      if (change) {
        if (change == 'DELETE') {
          this.game.players.splice(playerId, 1);
          this.game.player_images.splice(playerId, 1);
        } else {
          this.game.player_images[playerId] = change;
        };
        this.saveGame(this.game);
      };
    });
  };





}
