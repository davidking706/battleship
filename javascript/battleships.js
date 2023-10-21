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

  locationUsed(coordinate, recordIfUnused = true) {
    const used = this.usedCoords.some(coord => coord.every((num, index) => num === coordinate[index]));

    // If the location is not used save the coords in usedCoords //
    if (!used && recordIfUnused) {
      this.usedCoords.push(coordinate);
    }
    
    return used;
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
}

class CreateBot extends CreatePlayer {
  static botNames = ['BotAlpha', 'BotBeta', 'BotGamma', 'BotDelta', 'BotEpsilon', 'Owl_Dusty'];

  // Randomly selects a bot name //
  static randomBotName() {
    const randomIndex = Math.floor(Math.random() * CreateBot.botNames.length);
    return CreateBot.botNames[randomIndex];
  }
  
  constructor(dimensions, name = CreateBot.randomBotName(), ratio = 0.17) {
    super(dimensions, name, ratio);
    this.isBot = true;
    this.validPredictedPaths = [];
    this.initialHit;
    this.subsequentHit;
    this.moveDelta
    this.nextGuess;
  }

  guess() {
    let guess = this.nextGuess;
    console.log(guess);
    // If there are valid predicted paths, choose from them. Otherwise, generate a random guess.
    if (guess === undefined) {
      do {
        guess = this.randomGen.randomStart();
      } while (this.locationUsed(guess));
    }

    const coordToString = convertToString(guess);
    console.log(`${this.name} guessed: ${coordToString}`);

    return guess;
  }

  target(hit, guess) {
    switch (hit) {
      case 0:
        if (this.initialHit !== undefined) {
          if (this.subsequentHit !== undefined) {
            // Reverse the direction after missing following a subsequent hit
            this.moveDelta = this.moveDelta.map(value => -value);
            this.nextGuess = this.initialHit.map((value, index) => value + this.moveDelta[index]);
          } else {
            // For the first miss after an initial hit
            this.nextGuess = this.getNextMove();
          }
        } 
        break;

      case 1:  // Hit
        if (this.initialHit === undefined) {
          // First hit
          this.initialHit = guess;
          this.getValidPredictedPaths();
          this.nextGuess = this.getNextMove();
        } else {
          this.subsequentHit = guess
          
          // If moveDelta hasn't been determined yet (i.e., it's the hit right after the initialHit)
          if (this.moveDelta === undefined) {
            this.moveDelta = this.subsequentHit.map((value, index) => value - this.initialHit[index]);
          }

          // Calculate the next guess by adding moveDelta to the recent hit
          const potentialGuess = this.subsequentHit.map((value, index) => value + this.moveDelta[index]);

          if (this.isWithinBounds(potentialGuess) && !this.locationUsed(potentialGuess, false)) {
            this.nextGuess = potentialGuess;
          } else {
            // Treat it as a miss scenario and adjust moveDelta or select another potential move.
            this.moveDelta = this.moveDelta.map(value => -value);
            this.nextGuess = this.initialHit.map((value, index) => value + this.moveDelta[index]);
          }
        }
        break;    

      case 2:
        this.initialHit = undefined;
        this.subsequentHit = undefined;
        this.moveDelta = undefined;
        this.validPredictedPaths = [];
        this.nextGuess = undefined;
        break;
    
      default:
        break;
    }
  }

  generatePotentialPaths() {
    const numDimensions = this.initialHit.length;
    
    const directions = [...Array(numDimensions * 2)].map((_, index) => {
      const dimensionIndex = Math.floor(index / 2);
      const isPositive = index % 2 === 0;
      
      return [...Array(numDimensions)].map((_, innerIndex) => 
        innerIndex === dimensionIndex ? (isPositive ? 1 : -1) : 0
      );
    });
    
    return directions.map(direction => this.initialHit.map((val, index) => val + direction[index]));
  }

  isWithinBounds(coordinate) {
    return coordinate.every((value, index) => value >= 0 && value < this.dimensions[index]);
  }
  
  getValidPredictedPaths() {
    // Get all potential paths based on the coordinate
    const potentialPaths = this.generatePotentialPaths(this.initialHit);
    
    // Filter out any paths that the AI has already guessed or are out of bounds
    const validPaths = potentialPaths.filter(path => !this.locationUsed(path, false) && this.isWithinBounds(path));
    
    this.validPredictedPaths = validPaths;
  }

  getNextMove() {
    // Choose a random path from the valid paths
    const randomIndex = Math.floor(Math.random() * this.validPredictedPaths.length);
    const chosenPath = this.validPredictedPaths[randomIndex];

    // Add the chosen path to usedCoords
    this.usedCoords.push(chosenPath);

    // Remove the chosen path from validPredictedPaths
    this.validPredictedPaths.splice(randomIndex, 1);

    return chosenPath;
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