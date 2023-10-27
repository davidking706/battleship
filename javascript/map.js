class GenerateMap {
  constructor(dimensions) {
    // Checks if there is only one value in the given array //
    if (dimensions.length === 1) {
      dimensions = [dimensions[0], dimensions[0]];
    } else if (typeof dimensions === 'number') {
      dimensions = [dimensions, dimensions];
    }

    this.dimensions = dimensions;
    this.currentIndex = 1;
    this.map = this.createGrid(dimensions);
  }

  // Creates a grid of the given dimensions //
  createGrid(dimensions) {
    let outerDimension = dimensions[0];
    let innerDimension = dimensions[1];
    let map = [];

    for (let i = 0; i < outerDimension; i++) {
        let innerArray = [];
        for (let j = 0; j < innerDimension; j++) {
            innerArray.push(' '); // initializing with a blank space
        }
        map.push(innerArray);
    }
    return map;
  }

  // Adds a value to each index //
  setValue(coordinates, value) {
    let location = this.map;

    for (let i = 0; i < coordinates.length - 1; i++) {
      location = location[coordinates[i]];
    }

    location[coordinates[coordinates.length - 1]] = value;
  }

  // Gets the value from a specific location in the map //
  getValue(coordinates) {
    let location = this.map;

    for (let coord of coordinates) {
      location = location[coord];
    }

    return location;
  }

  getMap() {
    return this.map;
  }

  displayGrid() {
    if (this.dimensions.length !== 2) {
      console.log('Display is only supported for 2D grids.');
      return;
    }
    
    const [rows, cols] = this.dimensions;
    
    let header = '    ';
    for (let i = 1; i <= cols; i++) {
      header += i + '   ';
    }
    console.log(header);
    console.log('   ' + '—'.repeat(cols * 4));
    
    for (let i = 0; i < rows; i++) {
      let row = String.fromCharCode(65 + i) + '  |';
      for (let j = 0; j < cols; j++) {
        const value = this.map[i][j];
        row += ' ' + value + ' |';
      }
      console.log(row);
      console.log('   ' + '—'.repeat(cols * 4));
    }
  }
}

export { GenerateMap };