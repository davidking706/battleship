class GenerateMap {
  constructor(dimensions = 3) {
    // Checks if there is only one value in the given array //
    if (dimensions.length === 1) {
      dimensions = [dimensions[0], dimensions[0]];
    } else if (typeof dimensions === 'number') {
      dimensions = [dimensions, dimensions];
    }

    this.dimensions = dimensions;
    this.currentIndex = 0;
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
            innerArray.push(this.currentIndex++); // initializing with a blank space
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

  numberToLetters(n) {
    let result = '';
    
    while (n > 0) {
      n -= 1;
      result = String.fromCharCode((n % 26) + 65) + result;
      n = Math.floor(n / 26);
    }
    
    return result;
  }

  displayMap() {
    if (this.dimensions.length !== 2) {
        console.log('Display is only supported for 2D grids.');
        return;
    }
    
    const [rows, cols] = this.dimensions;

    // Determine the maximum width needed for column headers and row labels
    const maxColWidth = String(cols).length;
    const maxRowWidth = this.numberToLetters(rows).length;
    
    let header = ' '.repeat(maxRowWidth + 2);
    for (let i = 1; i <= cols; i++) {
        header += i.toString().padStart(maxColWidth, ' ');
        header += (i === cols) ? ' ' : '  ';  // Add double space for all but the last column
    }
    console.log(header);
    console.log(' '.repeat(maxRowWidth + 2) + '—'.repeat((maxColWidth + 2) * cols));
    
    for (let i = 0; i < rows; i++) {
        let row = this.numberToLetters(i + 1).padEnd(maxRowWidth) + ' |';
        for (let j = 0; j < cols; j++) {
            const value = String(this.map[i][j] = ' ');
            row += value.padStart(maxColWidth, ' ') + ' |';
        }
        console.log(row);
        console.log(' '.repeat(maxRowWidth + 2) + '—'.repeat((maxColWidth + 2) * cols));
    }
  }
}

export { GenerateMap };