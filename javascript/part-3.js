import * as rs from 'readline-sync';
import { GenerateMap } from "./map.js";
import { startNewGame, placeShipsOnMap, displayAllMaps, chooseMapSize } from './actions.js';

rs.keyInPause("Press any key to start the game.");
const mapSize = chooseMapSize();

let players = startNewGame(mapSize);
let maps = players.map(() => new GenerateMap(mapSize));

placeShipsOnMap(players[0], maps[0]);
// Cheats //
// for (let i = 0; i < players.length; i++) {
//   placeShipsOnMap(players[i], maps[i]);
// }
// Cheats //

let gameStart = true;
let resettingGame = false;
while (gameStart) {
  displayAllMaps(players, maps.map(map => map.createMap()));
  // Cheats //
  // console.log('-'.repeat(55));
  // for (const ship of players[1].ships) {
  //   console.log(ship.name, ship.coordinates);
  // }
  // console.log('-'.repeat(55));
  // Cheats //
    
  for (let i = 0; i < players.length; i++) {
    const otherPlayers = players.filter((_currentplayer, index) => index != i);
    const otherMaps = maps.filter((_currentmap, index) => index != i);
    
    for (let j = 0; j < otherPlayers.length; j++) {
      const player = players[i];
    
      console.log(`\x1B[1m${player.color}${player.name}'s turn: `);
      const guess = player.guess();

      const otherPlayer = otherPlayers[j];
      const [isHit, shipHit] = otherPlayer.checkHitOrMiss(guess, player.name);

      if (player.isBot) {
        player.target(isHit, guess, shipHit);
      }

      const hitTypes = {
        hit: `\x1B[1m${player.color}X\x1B[0m`,
        miss: `\x1B[1m${player.color}O\x1B[0m`,
      }
      
      otherMaps.forEach(otherMap => {
        if (otherMap.getValue(guess) !== hitTypes.hit) {
          otherMap.setValue(guess, isHit !== 0 ? hitTypes.hit : hitTypes.miss);
        }
      });

      displayAllMaps(players, maps.map(map => map.createMap()));

      console.log();
      if (otherPlayer.ships.length === 0) {
        gameStart = false;
        
        const playAgain = rs.keyInYNStrict(`\x1B[1m${player.color}${player.name} has destroyed all battleships. Would you like to play again?: `);
        if (playAgain) {
          players = startNewGame(mapSize);
          maps = players.map(() => new GenerateMap(mapSize));

          gameStart = true;
          resettingGame = true;
        }
      }
    }
    
    if (!gameStart || resettingGame) {
      break;
    }
  }
  resettingGame = false;
}
