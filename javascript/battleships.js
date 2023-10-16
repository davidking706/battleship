class CreateBattleships {
  static shipTypes = [
    { name: "Carrier", size: 5 },
    { name: "Battleship", size: 4 },
    { name: "Destroyer", size: 3 },
    { name: "Cruiser", size: 3 },
    { name: "Submarine", size: 2 },
    { name: "Patrol Boat", size: 1 }
  ];
  
  constructor(dimensions, ratio = 0.17) {
    this.dimensions = dimensions;
    this.totalCells = dimensions.reduce((acc, val) => acc * val);
    this.maxShipCoords = Math.ceil(this.totalCells * ratio);
    this.generator = new CreateCoordinates(dimensions);
    this.ships = this.placeShips();
    this.usedCoords = [];
  }

  // Saves the number and types of ships based on ships allowed //
  shipList() {
    let cellsLeft = this.maxShipCoords;
    let ships = [];

    while (cellsLeft > 0) {
      if (this.totalCells <= 64) {
        CreateBattleships.shipTypes.reverse()
      }
      for (let shipType of CreateBattleships.shipTypes) {
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
      coordinates: this.generator.generateCoords(ship.size)
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
      console.log("You have already picked this location. Miss!");
      return true;
    }
  }

  checkHitOrMiss(predictedCoords) {
    if (!this.locationUsed(predictedCoords)) {
      for (let i = 0; i < this.ships.length; i++) {
        const ship = this.ships[i];
        const coordinate = ship.coordinates.findIndex(coord => coord.every((num, index) => num === predictedCoords[index]));

        if (coordinate !== -1) {
          ship.coordinates.splice(coordinate, 1);
        }

        if (ship.coordinates.length === 0) {
          this.ships.splice(i, 1);
          i--;
          return console.log(`Hit. You have sunk a ${ship.name}. ${this.ships.length} ship remaining.`);
        }
      }
      return console.log("You have missed!");
    }
  }

  bot() {
    return this.generator.randomStart()
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

export { CreateBattleships, CreateCoordinates };