import * as rs from 'readline-sync'
import { convertStringToCoordinates, convertToString } from './actions.js';

class CreatePlayer {
  static shipTypes = [
    { name: "Carrier", size: 5 },
    { name: "Battleship", size: 4 },
    { name: "Destroyer", size: 3 },
    { name: "Cruiser", size: 3 },
    { name: "Submarine", size: 2 },
    { name: "Patrol Boat", size: 1 }
  ];
  
  constructor(dimensions, name = 'bot', ratio = 0.17) {
    this.name = name;
    this.dimensions = dimensions;
    this.totalCells = dimensions.reduce((acc, val) => acc * val);
    this.maxShipCoords = Math.ceil(this.totalCells * ratio);
    this.randomGen = new CreateCoordinates(dimensions);
    this.ships = this.placeShips();
    this.usedCoords = [];
  }

  // Saves the number and types of ships based on ships allowed //
  shipList() {
    let cellsLeft = this.maxShipCoords;
    let ships = [];

    while (cellsLeft > 0) {
      if (this.totalCells <= 64) {
        CreatePlayer.shipTypes.reverse()
      }
      for (let shipType of CreatePlayer.shipTypes) {
        if (cellsLeft >= shipType.size) {
          ships.push({ ...shipType, coordinates: [] });
          cellsLeft -= shipType.size;
        }
      }
    }

    return ships;
  }

  // Place ships on the board //
  placeShips() {
    return this.shipList().map(ship => ({
      ...ship,
      coordinates: this.randomGen.generateCoords(ship.size)
    }));
  }

  // Getter method for ships //
  getShips() {
    return this.ships;
  }

  locationUsed(coordinate) {
    const used = this.usedCoords.some(coord => coord.every((num, index) => num === coordinate[index]));

    if (!used) {
      this.usedCoords.push(coordinate);
      return false;
    } else {
      return true;
    }
  }

  checkHitOrMiss(predictedCoords, playerName) {
    if (predictedCoords !== undefined) {
      for (let i = 0; i < this.ships.length; i++) {
        const ship = this.ships[i];
        const coordinate = ship.coordinates.findIndex(coord => coord.every((num, index) => num === predictedCoords[index]));

        if (coordinate !== -1) {
          ship.coordinates.splice(coordinate, 1);

          if (ship.coordinates.length === 0) {
            this.ships.splice(i, 1);
            i--;
            return console.log(`Hit. ${playerName} has sunken a ${ship.name}. ${this.ships.length} ship remaining.`);
          } else {
            console.log('Hit!');
          }
        }
        
      }
      return console.log(`${playerName} has missed!`);
    }
  }

  guess() {
    let guess;
     do {
      guess = rs.question("Enter a location to strike (ie 'A2)': ");
      if (guess === '') {
        console.log('You did not choose a location. Try again');
      }
    } while (guess === '');

    const guessConverted = convertStringToCoordinates(guess);
    
    if (!this.locationUsed(guessConverted)) {
      return guessConverted
    } else {
      console.log(`You have already picked this location. Miss!`);
    }
  }
}

class CreateBot extends CreatePlayer {
  static botNames = ['BotAlpha', 'BotBeta', 'BotGamma', 'BotDelta', 'BotEpsilon'];

  static randomBotName() {
    const randomIndex = Math.floor(Math.random() * CreateBot.botNames.length);
    return CreateBot.botNames[randomIndex];
  }
  
  constructor(dimensions, name = CreateBot.randomBotName(), ratio = 0.17) {
    super(dimensions, name, ratio)
  }

  guess() {
    let guess;

    do {
      guess = this.randomGen.randomStart();
    } while (this.locationUsed(guess));

    const coordToString = convertToString(guess);
    console.log(`${this.name} guessed: ${coordToString}`);

    return guess
  }
}

class CreateCoordinates {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.takenCoords = new Set();
  }

  // Generate coordinates for a ship //
  generateCoords(size) {
    let coords;

    do {
      const start = this.randomStart();
      const direction = Math.floor(Math.random() * this.dimensions.length);
      coords = Array.from({ length: size }).map((_, i) => {
        let coord = [...start];
        coord[direction] += i;
        return coord;
      });
    } while (!this.isFree(coords));

    coords.forEach(coord => this.takenCoords.add(JSON.stringify(coord)));
    return coords;
  }

  // Get a random starting position //
  randomStart() {
    return this.dimensions.map(dim => Math.floor(Math.random() * dim));
  }

  // Check if the placement is valid //
  isFree(coords) {
    return coords.every(coord => 
      coord.every((value, idx) => value >= 0 && value < this.dimensions[idx]) &&
      !this.takenCoords.has(JSON.stringify(coord))
    );
  }
}

export { CreatePlayer, CreateBot };