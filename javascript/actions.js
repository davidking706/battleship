import * as rs from 'readline-sync';
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
      {hideEchoBack: true, mask: '', limit: 'adADM '});
    if (key === 'a' || key === 'A' ) { if (value > MIN) { value--; } }
    else if (key === 'd' || key === 'D') { if (value < MAX) { value++; } }
    else if (key === 'M') {
      resfresh();

      const customMapMode = 'You Have Entered Custom Modeling Mode';
      const customizeMap = 'How would you like to customize the map dimensions?';
      const center = ' '.repeat((customizeMap.length / 2) - (customMapMode.length / 2))

      console.log(center + `\x1B[1;32m${customMapMode}\x1B[0m`);
      console.log(customizeMap);

      let newDimensions;
      do {
        const dimensions = rs.question(`Enter dimensions (current: ${value}x${value}): `);
        newDimensions = dimensions.match(/\d+/g).map(Number);
    
        if (newDimensions.length < 2 || !newDimensions.every(num => num >= 3)) {
          console.log('\x1B[31mThis dimension cannot be used, please try again.\x1B[0m');
        }
        
      } while (newDimensions.length < 2 || !newDimensions.every(num => num >= 3));

      value = newDimensions;
      break;
    }
    else { break; }
  }

  return value;
}

function resfresh() {
  process.stdout.write('\x1Bc\x1B[0m');
}

function getOrientation(shipCoords, orientationsMatrix) {
  if (shipCoords.length === 1) {
    return -1;
  }

  const sampleCoords = shipCoords.slice(0, 2);
  const orientationVector = sampleCoords[1].map((coord, index) => coord - sampleCoords[0][index]);
  
  const orientationIndex = orientationsMatrix.findIndex(orientation =>
    orientation.every((val, index) => val === orientationVector[index])
  );

  return orientationIndex; // This will be 0 for horizontal, 1 for vertical in a 2D grid
}

function placePlayerShips(shipCoords, shipSize, color, map, orientationsMatrix) {
  const shipParts = {
    square: `${color}\u25FC\x1B[0m`,
    leftPointer: `${color}\u25C0\x1B[0m`,
    rightPointer: `${color}\u25B6\x1B[0m`,
    upPointer: `${color}\u25B2\x1B[0m`,
    downPointer: `${color}\u25BC\x1B[0m`
  };

  const orientationIndex = getOrientation(shipCoords, orientationsMatrix);
  // Set the middle parts of the ship
  shipCoords.forEach(coord => map.setValue(coord, shipParts.square));

  // Set the first and last parts of the ship
  if (shipCoords.length > 1) {
    map.setValue(shipCoords[0], orientationIndex === 0 ? shipParts.upPointer : shipParts.leftPointer);
    map.setValue(shipCoords[shipSize - 1], orientationIndex === 0 ? shipParts.downPointer : shipParts.rightPointer);
  }
}

function placeShipsOnMap(player, map) {
  // Generate the orientation matrix using the map's dimensions
  const orientationsMatrix = map.generateOrientationMatrix();

  // Place each ship on the map
  player.ships.forEach(ship => {
    placePlayerShips(ship.coordinates, ship.size, player.color, map, orientationsMatrix);
  });
}

function displayAllMaps(players, maps, space = 3) {
  resfresh()
  // Find the maximum height of the maps to standardize their heights
  const maxHeight = Math.max(...maps.map(map => map.length));
  const spacer = ' '.repeat(space); // Create the spacer string
  
  const mapLength = maps[0][maps[0].length - 1].length - 8
  players.forEach(player => {
    process.stdout.write(`  \x1B[1m${player.color}${player.name}\x1B[0m` + ' '.repeat((mapLength) - player.name.length));
  });
  console.log('\n');
  
  // Create an array to hold the combined maps
  let combinedMaps = new Array(maxHeight).fill('');

  // Go through each map
  for (const map of maps) {
    for (let i = 0; i < maxHeight; i++) {
      // If the current map has a row at this height, add it; otherwise, add padding
      combinedMaps[i] += (map[i] || ' '.repeat(map[0].length)) + spacer;
    }
  }

  // Log the combined maps to the terminal
  combinedMaps.forEach(row => console.log(row));

  const allShips = players.map(player => player.ships.map(ship => ship.name));
  const numOfPlayerShips = allShips.map(playerShips => playerShips.length);

  for (let i = 0; i < Math.max(...numOfPlayerShips); i++) {
    for (let j = 0; j < allShips.length; j++) {
      const ship = allShips[j][i];
      if (ship) {
        process.stdout.write(`  \x1B[1m${players[j].color}${ship}\x1B[0m` + ' '.repeat((mapLength) - ship.length));
      } else {
        process.stdout.write(`  ` + ' '.repeat((maps[0].length * 2)));
      }
    }
    console.log();
  }
  console.log();

  return combinedMaps;
}

function getPlayers() {
  let numOfPlayers;
  do {
    numOfPlayers = rs.questionInt(`Enter a number of players: `, {
      defaultInput: 2
    });

    if (numOfPlayers < 2 || numOfPlayers > 4) {
      console.log(`Please enter a number within the range 2 to 4.`);
    }
  } while (numOfPlayers < 2 || numOfPlayers > 4);

  let playerNames = [];
  for (let i = 0; i < numOfPlayers; i++) {
    playerNames.push(rs.question('name: '));
  }

  return {
    numOfPlayers,
    playerNames 
  }
}

function startNewGame(dimensions = 3, numOfPlayers = 2, playerNames = ['player1'], ratio = 0.17) {
  const map = new GenerateMap(dimensions).dimensions;

  const playerColors = ['\x1B[34m', '\x1B[35m', '\x1B[36m'];
  
  const getRandomTrueColor = () => {
    const randomValue = () => Math.floor(Math.random() * 256);
    return `\x1B[38;2;${randomValue()};${randomValue()};${randomValue()}m`;
  }
  
  const randomBotName = () => {
    const botNames = ['BotAlpha', 'BotBeta', 'BotGamma', 'BotDelta', 'BotEpsilon', 'Owl_Dusty'];

    const randomIndex = Math.floor(Math.random() * botNames.length);
    return botNames[randomIndex];
  }

  
  let players = [];
  for (let i = 0; i < numOfPlayers; i++) {
    let color;
    if (playerColors.length) {
      color = playerColors[0];
      playerColors.splice(0, 1);
    } else {
      color = getRandomTrueColor();
    }

    if (playerNames[i] !== '') {
      players.push(new CreatePlayer(map, playerNames[i], color, ratio));
    } else {
      players.push(new CreateBot(map, randomBotName(), color, ratio));
    }
  }

  return players
}

export { convertStringToCoordinates, convertToString, startNewGame, chooseMapSize, placeShipsOnMap, displayAllMaps, getPlayers }