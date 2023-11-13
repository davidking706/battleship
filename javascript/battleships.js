import * as rs from 'readline-sync'
import { convertStringToCoordinates, convertToString } from './actions.js';

class CreatePlayer {
  
  constructor(dimensions, name = 'player1', color, ratio = 0.17) {
    this.shipTypes = [
      { id: 1, name: "Carrier", size: 5 },
      { id: 2, name: "Battleship", size: 4 },
      { id: 3, name: "Destroyer", size: 3 },
      { id: 4, name: "Cruiser", size: 3 },
      { id: 5, name: "Submarine", size: 2 },
      { id: 6, name: "Patrol Boat", size: 1 }
    ]; 

    this.name = name;
    this.color = color
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
        this.shipTypes.reverse();
      }


      for (let shipType of this.shipTypes) {
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
    return this.shipList().map((ship, index) => ({
      ...ship,
      id: (ship.id * 10) + index,
      coordinates: this.randomGen.generateCoords(ship.size)
    }));
  }

  // Getter method for ships //
  getShips() {
    return this.ships;
  }

  locationUsed(coordinate) {
    return this.usedCoords.some(coord => coord.every((num, index) => num === coordinate[index]));
  }

  recordLocation(coordinate) {
    this.usedCoords.push(coordinate);
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
            return [2, ship.id]
          } else {
            console.log(`Hit! ${ship.name}`);
            return [1, ship.id]
          }
        }
      }
      console.log(`${playerName} has missed!`);
      return [0]
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
        } else if (guessConverted.length !== this.dimensions.length) {
          console.log('This is not a proper location. Try again.');
        }
      } else {
        console.log('You did not choose a location. Try again.');
      }
    } while (guess === '' || !guessConverted.every((coord, index) => coord >= 0 && coord < this.dimensions[index]) || guessConverted.length !== this.dimensions.length);

    if (this.locationUsed(guessConverted)) {
      console.log(`You have already picked this location. Miss!`);
    } else {
      this.recordLocation(guessConverted);
    }
  

    return guessConverted;
  }
}

class CreateBot extends CreatePlayer {
  constructor(dimensions, name = 'bot', ratio = 0.17) {
    super(dimensions, name, ratio);
    this.isBot = true;
    this.validPredictedPaths = [];
    this.unsunkShips = []
    this.currentTarget;
    this.initialHit;
    this.subsequentHit;
    this.moveDelta
    this.nextGuess;
  }

  guess() {
    let guess = this.nextGuess;
    // If there are valid predicted paths, choose from them. Otherwise, generate a random guess.
    if (guess === undefined) {
      do {
        guess = this.randomGen.randomStart();
      } while (this.locationUsed(guess));
    }

    this.recordLocation(guess);
  
    const coordToString = convertToString(guess);
    console.log(`${this.name} guessed: ${coordToString}`);

    return guess;
  }

  target(hit, guess, shipId) {
    const HIT_VALUES = {
      MISS: 0,
      HIT: 1,
      SINK: 2
    };

    switch (hit) {
      case HIT_VALUES.MISS: // Miss
        if (this.initialHit) {
          if (this.subsequentHit) {
            this.moveDelta = this.moveDelta.map(value => -value);
            this.nextGuess = this.initialHit.map((value, index) => value + this.moveDelta[index]);
          } else {
            this.nextGuess = this.getNextMove();
          }
        }
        break;

      case HIT_VALUES.HIT: // Hit
        if (!this.isShipTracked(shipId)) {
          this.trackShip(shipId, guess);
        }

        if (!this.initialHit) {
          const { id, coord } = this.unsunkShips[0];
          this.currentTarget = id;
          this.initialHit = coord;

          this.generatePotentialPaths();
          this.nextGuess = this.getNextMove();
        } else {
          if (shipId === this.currentTarget) {
            this.subsequentHit = guess;

            if (!this.moveDelta) {
              this.moveDelta = this.subsequentHit.map((value, index) => value - this.initialHit[index]);
            }

            this.nextGuess = this.subsequentHit.map((value, index) => value + this.moveDelta[index]);
          } else {
            // this.trackShip(shipId, guess);
            this.nextGuess = this.getNextMove();
          }
        }
        break;    

      case HIT_VALUES.SINK: // Sink
        if (shipId === this.currentTarget) {
          this.validPredictedPaths = [];
          this.currentTarget = undefined;
          this.moveDelta = undefined;
          this.subsequentHit = undefined;
          this.nextGuess = undefined;

          this.unsunkShips = this.unsunkShips.filter((_, index) => index !== 0);
          // console.log(this.unsunkShips.length);
          
          if (this.unsunkShips.length > 0) {
            const { id, coord } = this.unsunkShips[0];
            this.currentTarget = id;
            this.initialHit = coord;
  
            this.generatePotentialPaths();
            this.nextGuess = this.getNextMove();
          } else {
            // this.unsunkShips = []
            this.initialHit = undefined;
          }
        } else {
          this.nextGuess = this.getNextMove();
        }
        break;
    }

    // console.log('');
    // console.log("usedCoords: " + this.usedCoords);
    // console.log("validPredictedPaths: " + this.validPredictedPaths);
    // console.log("unsunkShips: " + this.unsunkShips.length);
    // console.log("currentTarget: " + this.currentTarget);
    // console.log("initialHit: " + this.initialHit);
    // console.log("subsequentHit: " + this.subsequentHit);
    // console.log("moveDelta: " + this.moveDelta);
    // console.log("nextGuess: " + this.nextGuess);
  }

  isShipTracked(shipId) {
    return this.unsunkShips.some(ship => ship.id === shipId);
  }

  trackShip(shipId, guess) {
    const newShip = {
      id: shipId,
      coord: guess
    }

    this.unsunkShips.push(newShip)
  }

  isWithinBounds(coordinate) {
    return coordinate.every((value, index) => value >= 0 && value < this.dimensions[index]);
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

    const potentialPaths = directions
    .map(direction => this.initialHit.map((val, index) => val + direction[index]))
    .filter(path => !this.locationUsed(path) && this.isWithinBounds(path));

    this.validPredictedPaths = potentialPaths;
  }

  getNextMove() {
    // Choose a random path from the valid paths
    const randomIndex = Math.floor(Math.random() * this.validPredictedPaths.length);
    const chosenPath = this.validPredictedPaths[randomIndex];
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