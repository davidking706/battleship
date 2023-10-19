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
    this.isBot = false;
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

    // If the location is not used save the coords in usedCoords //
    if (!used) {
      this.usedCoords.push(coordinate);
      return false;
    } else {
      return true;
    }
  }

  checkHitOrMiss(predictedCoords, playerName) {
    if (predictedCoords !== undefined) {
      // Loop through all the ships of the player //
      for (let i = 0; i < this.ships.length; i++) {
        const ship = this.ships[i];
        const coordinate = ship.coordinates.findIndex(coord => coord.every((num, index) => num === predictedCoords[index]));

        if (coordinate !== -1) {
          ship.coordinates.splice(coordinate, 1);

          if (ship.coordinates.length === 0) {
            this.ships.splice(i, 1);
            i--;
            console.log(`Hit. ${playerName} has sunken a ${ship.name}. ${this.ships.length} ship remaining.`);
            return 2
          } else {
            console.log(`Hit! ${ship.name}`);
            return 1
          }
        }
      }
      console.log(`${playerName} has missed!`);
      return 0
    }
  }

  guess() {
    let guess;
    let guessConverted;

    do {
      // Prompt for a guess
      guess = rs.question("Enter a location to strike (ie 'A2'): ");
      
      if (guess !== '') {
        guessConverted = convertStringToCoordinates(guess);

        if (!guessConverted.every((coord, index) => coord >= 0 && coord < this.dimensions[index])) {
          console.log('The chosen location is outside the grid. Try again.');
        } 
      } else {
        console.log('You did not choose a location. Try again');
      }
    } while (guess === '' || !guessConverted.every((coord, index) => coord >= 0 && coord < this.dimensions[index]));

    if (this.locationUsed(guessConverted)) {
      console.log(`You have already picked this location. Miss!`);
    }

    return guessConverted;
  }

  isHit () {

  }
}

class CreateBot extends CreatePlayer {
  static botNames = ['BotAlpha', 'BotBeta', 'BotGamma', 'BotDelta', 'BotEpsilon', 'Owl_Dusty'];

  // Randomly selects a bot name //
  static randomBotName() {
    const randomIndex = Math.floor(Math.random() * CreateBot.botNames.length);
    return CreateBot.botNames[randomIndex];
  }
  
  constructor(dimensions, name = CreateBot.randomBotName(), ratio = 0.17) {
    super(dimensions, name, ratio)
    this.isBot = true;
    this.initialHit = undefined;
    this.previousHit = undefined;
    this.orientation = undefined;
    this.direction = undefined;
    this.nextGuess = undefined;
    this.changeOrientation = Math.floor(Math.random()) < 0.5 ? true : false;
  }

  guess() {
    let guess = this.nextGuess;

    if (guess === undefined) {
      // Makes sure that the coordinate is not repeated //
      do {
        guess = this.randomGen.randomStart();
      } while (this.locationUsed(guess));
    }

    const coordToString = convertToString(guess);
    console.log(`${this.name} guessed: ${coordToString}`);

    return guess
  }

  target(hit, guess) {
    switch (hit) {
      case 0: // Miss //
        if (this.initialHit === undefined) {
          break
        }

        if (this.previousHit === undefined) {
          if (this.changeOrientation) {
            let availableOrientations = Array.from({ length: this.initialHit.length }, (_, i) => i);
            availableOrientations.splice(this.orientation, 1);
            this.orientation = availableOrientations[Math.floor(Math.random() * availableOrientations.length)];

            this.changeOrientation = false;
          } else {
            this.direction = -this.direction;
            this.changeOrientation = true;
          }
        } else {
          this.direction = -this.direction;
        }

        this.nextGuess = [...this.initialHit];
        this.nextGuess[this.orientation] += this.direction;

        break;

      case 1: // Hit //
        if (this.initialHit === undefined) {
          this.initialHit = guess;
        }

        this.previousHit = this.nextGuess;

        if (this.orientation === undefined) {
          this.orientation = Math.floor(Math.random() * guess.length);
          this.direction = Math.random() < 0.5 ? -1 : 1;
        }

        this.nextGuess = [...guess];
        this.nextGuess[this.orientation] += this.direction;

        break;

      case 2: // Ship sunk //
        this.initialHit = undefined;
        this.previousHit = undefined;
        this.orientation = undefined;
        this.direction = undefined;
        this.nextGuess = undefined;

        break;

      default:
        break;
    }

    // If nextGuess exists and is out of bounds for the chosen orientation, adjust it //
    if (this.nextGuess) {
      const isWithinBounds = this.nextGuess.every((value, index) => value >= 0 && value < this.dimensions[index]);
      
      if (!isWithinBounds) {
        while (this.nextGuess[this.orientation] < 0 || this.nextGuess[this.orientation] >= this.dimensions[this.orientation]) {
          this.direction = -this.direction;
          this.nextGuess[this.orientation] += 2 * this.direction;
        }
      }
  
      if (this.locationUsed(this.nextGuess)) {
        this.nextGuess[this.orientation] += this.direction;
      }
    }
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