import * as rs from 'readline-sync'
import { CreateMap } from "./map.js";
import { CreateBattleships } from "./battleships.js";
import { convertStringToCoordinates } from './actions.js';

const dimensions = [3];
const map = new CreateMap(dimensions);

const player1 = new CreateBattleships(map.dimensions)
const player2 = new CreateBattleships(map.dimensions)


// rs.keyInPause('Press any key to start the game.');
// const p1Guess = rs.question("Enter a location to strike ie 'A2' ");

// console.log(convertStringToCoordinates(p1Guess));

for (const ship of player1.getShips()) {
  console.log(ship);
}


while (player1.getShips().length > 0) {
  const p1Guess = rs.question("Enter a location to strike ie 'A2' ");
  const converted = convertStringToCoordinates(p1Guess);

  player1.checkHitOrMiss(converted);
}