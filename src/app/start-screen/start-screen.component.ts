import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';
import { query, orderBy, limit, where, Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Injectable, inject } from '@angular/core';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent {

  game: Game;
  firestore: Firestore = inject(Firestore);
  newUrl;



  constructor(private router: Router) { }

  async newGame() {
    //Start Game
    this.game = new Game;
    await addDoc(collection(this.firestore, 'games'), this.game.toJson('')).then(docRef => {
      console.log("Document written with ID: ", docRef.id);
      this.newUrl = docRef.id;
    })

    this.router.navigateByUrl(`/game/${this.newUrl}`);

  }








}
