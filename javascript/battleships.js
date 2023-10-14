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
    this.maxShipCells = Math.ceil(this.totalCells * ratio);
    this.generator = new CoordinateGenerator(dimensions);
    this.ships = this.placeShips();
  }

  // Saves the number and types of ships based on ships allowed //
  shipList() {
    let cellsLeft = this.maxShipCells;
    let ships = [];

    while (cellsLeft > 0) {
      for (let type of CreateBattleships.shipTypes) {
        if (cellsLeft >= type.size) {
          ships.push({ ...type, coordinates: [] });
          cellsLeft -= type.size;
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
}

class CoordinateGenerator {
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

// Example //
const allocator = new CreateBattleships([8, 8, 8]);
console.log(allocator);
