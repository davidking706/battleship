import * as rs from 'readline-sync'
import { GenerateMap } from "./map.js";
import { CreatePlayer, CreateBot } from "./battleships.js";

function convertStringToCoordinates(str) {
  // Separates the string in alphabetical and numerical parts into an array //
  const separation = str.match(/([A-Z]+|\d+)/ig);

  if (/[A-Z]+/ig.test(str)) {
    return separation.map((value) => {
      if (isNaN(value)) {
        // Convert all letters to its numerical form //
        return value.split('').reverse().map((char, charIndex) =>
          (char.toUpperCase().charCodeAt(0) - 64) * (26 ** charIndex)
        ).reduce((acc, curr) => acc + curr) - 1;
      } else {
        // Subtract 1 to convert it to a zero-based index //
        return parseInt(value, 10) - 1;
      }
    });
  } else {
    return separation.map(value => parseInt(value, 10))
  }
}

function convertToString(coords) {
  if (coords.length <= 3) {
    const string = coords.map((value, index) => {
      if (index === 0) {
        // Convert the first number to a letter //
        return String.fromCharCode(value + 65);
      } else if (index === 1) {
        // Convert the second number incremented by 1 //
        return value + 1;
      } else if (index === 2) {
        // Convert the third number incremented by 1 next to "Sector " //
        return `Sector ${value + 1}`;
      }
    });
    return `${string.splice(2,1)} ${string.join('')}`
  }

  return JSON.stringify(coords)
}

function chooseMapSize() {
  const MAX = 20;
  const MIN = 3;
  let value = 3;
  let key;
  
  console.log('    \x1B[1;32mChoose a Map Size\x1B[0m');
  console.log('[A] <- -> [D]  FIX: [SPACE] \n');

  while (true) {
    console.log('\x1B[1A\x1B[K|' +
      (new Array(value - 2)).join('-') + 'O' +
      (new Array(MAX - value + 1)).join('-') + '| ' + value);
    key = rs.keyIn('',
      {hideEchoBack: true, mask: '', limit: 'ad '});
    if (key === 'a') { if (value > MIN) { value--; } }
    else if (key === 'd') { if (value < MAX) { value++; } }
    else { break; }
  }

  console.log('\nA value the user requested: ' + value);

  return value;
}

function startNewGame(dimensions = 3, numOfPlayers = 2, playerNames = ['player1'], ratio = 0.17) {
  const map = new GenerateMap(dimensions)

  let players = [];
  for (let i = 0; i < numOfPlayers; i++) {
    if (i < playerNames.length) {
      players.push(new CreatePlayer(map.dimensions, playerNames[i], ratio));
    } else {
      players.push(new CreateBot(map.dimensions, undefined, ratio));
    }
  }

  return players
}

export { convertStringToCoordinates, convertToString, startNewGame, chooseMapSize }