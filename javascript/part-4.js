import * as rs from 'readline-sync';
import { GenerateMap } from "./map.js";
import { startNewGame, placeShipsOnMap, displayAllMaps, chooseMapSize, getPlayers } from './actions.js';

rs.keyInPause("Press any key to start the game.");
const settings = getPlayers();
const mapSize = chooseMapSize();

let players = startNewGame(mapSize, settings.numOfPlayers, settings.playerNames);
let maps = players.map(() => new GenerateMap(mapSize));

console.log(players);
console.log();
console.log(maps);

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
  // players.forEach(player => {
  //   console.log(`${player.color}${player.name}\x1B[0`);
  //   for (const ship of player.ships) {
  //     console.log(`${player.color}${ship.name}: [${ship.coordinates}]\x1B[0m`);
  //   }
  //   console.log();
  // });
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
          players = startNewGame(mapSize, settings.numOfPlayers, settings.playerNames);
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