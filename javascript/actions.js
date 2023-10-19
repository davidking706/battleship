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
  return coords.map((value, index) => {
    if (index === 0) {
      // Convert the first number to a letter //
      return String.fromCharCode(value + 65);
    } else if (index === 1) {
      // Convert the second number incremented by 1 //
      return value + 1;
    } else if (index === 2) {
      // Convert the third number incremented by 1 next to "Sector " //
      return `Sector ${value + 1} `;
    }
  }).join('');
}

function startNewGame(dimensions = 3, playerNames = ['player1'], numOfPlayers = 2) {
  const map = new GenerateMap(dimensions);

  let players = [];
  for (let i = 0; i < numOfPlayers; i++) {
    if (i < playerNames.length) {
      players.push(new CreatePlayer(map.dimensions, playerNames[i]));
    } else {
      players.push(new CreateBot(map.dimensions));
    }
  }

  return players
}

export { convertStringToCoordinates, convertToString, startNewGame }