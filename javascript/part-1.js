import * as rs from 'readline-sync'
import { startNewGame } from './actions.js';
import { GenerateMap } from './map.js';

rs.keyInPause("Press any key to start the game.");

let players = startNewGame(10);
let gameStart = true;
let resettingGame = false;

while (gameStart) {
// Cheats //
  console.log('-'.repeat(55));
  for (const ship of players[1].ships) {
    console.log(ship.coordinates);
  }
  console.log('-'.repeat(55));
// Cheats //

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    console.log(`${player.name}'s turn:`);
    
    const guess = player.guess();
    // console.log(guess);
    const otherPlayers = players.filter((_currentplayer, index) => index != i);
    
    for (const otherPlayer of otherPlayers) {
      const hit = otherPlayer.checkHitOrMiss(guess, player.name);
      if (player.isBot) {
        player.target(hit, guess);
      }
      
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