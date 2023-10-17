import * as rs from 'readline-sync'
import { CreateMap } from "./map.js";
import { CreateBattleships } from "./battleships.js";
import { convertStringToCoordinates } from './actions.js';

const dimensions = [3];
const map = new CreateMap(dimensions);

const player1 = new CreateBattleships('player1', map.dimensions)
const player2 = new CreateBattleships('player2', map.dimensions)


// rs.keyInPause('Press any key to start the game.');

// for (const ship of player1.getShips()) {
//   console.log(ship);
// }

for (const ship of player2.getShips()) {
  console.log(ship);
}


// const gameInPlay = true

// while (gameInPlay) {
//   const p1Guess = rs.question("Enter a location to strike ie 'A2' ");
//   const guessConverted = convertStringToCoordinates(p1Guess);
//   player2.checkHitOrMiss(guessConverted);

//   const botGuess = player2.bot();
//   console.log(botGuess);
//   player1.checkHitOrMiss(botGuess);
// }

// let play = 0;
// while (play < 4) {
//   const p1Guess = rs.question("Enter a location to strike (ie 'A2)': ");
//   const guessConverted = convertStringToCoordinates(p1Guess);

  
//   if (!player1.locationUsed(guessConverted)) {
//     player2.checkHitOrMiss(guessConverted)
//     console.log(player1.usedCoords)
//   }
//   play++
// }