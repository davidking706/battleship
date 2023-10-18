import * as rs from 'readline-sync'
import { startNewGame } from './actions.js';
import { GenerateMap } from './map.js';

let players = startNewGame();
let gameStart = true;
let resettingGame = false;

while (gameStart) {
  // for (const ship of players[1].ships) {
  //   console.log(ship.coordinates);
  // }

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    console.log(`${player.name}'s turn:`);

    const guess = player.guess();  
    const otherPlayers = players.filter((_currentplayer, idx) => idx != i);
    
    for (const otherPlayer of otherPlayers) {
      otherPlayer.checkHitOrMiss(guess, player.name);
      console.log();
      
      if (otherPlayer.ships.length === 0) {
        gameStart = false;
        
        const playAgain = rs.keyInYNStrict(`${player.name} has destroyed all battleships. Would you like to play again?: `);
        if (playAgain) {
          players = startNewGame();
          gameStart = true;
          resettingGame = true;
          break;
        }
      }
    }

    if (!gameStart || resettingGame) {
      break;
    }
  }

  resettingGame = false;
}