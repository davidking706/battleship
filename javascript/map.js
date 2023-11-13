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
            innerArray.push(''); // initializing with a blank space
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

  generateOrientationMatrix() {
    const matrix = [];
    for (let i = 0; i < this.dimensions.length; i++) {
      const orientationArray = new Array(this.dimensions.length).fill(0);
      orientationArray[i] = 1;
      matrix.push(orientationArray);
    }
    return matrix;
  }
  

  createMap() {
    if (this.dimensions.length !== 2) {
      return ['Display is only supported for 2D grids.'];
    }
    
    const [rows, cols] = this.dimensions;
    
    const cellWidth = 4;
    const cellPadding = ' '.repeat(cellWidth - 1);
    
    // Box-drawing characters
    const boxChars = {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│',
      teeLeft: '├',
      teeRight: '┤',
      teeTop: '┬',
      teeBottom: '┴',
      cross: '┼'
    };
    
    // ANSI color and style codes
    const styles = {
      reset: '\x1B[0m',
      bold: '\x1B[1m',
      board: '\x1B[37m',
      characters: '\x1B[33m'
    };
    
    const rowLabelWidth = this.numberToLetters(rows).length + 1;
    
    let mapArray = [];
    
    // Create column headers
    let columnHeader = ' '.repeat(rowLabelWidth + 1);
    for (let i = 1; i <= cols; i++) {
      let header = styles.bold + styles.characters + `${i}`.padStart(Math.floor((cellWidth + `${i}`.length) / 2)).padEnd(cellWidth) + styles.reset;
      columnHeader += header;
    }
    mapArray.push(columnHeader);
    
    // Create top border
    const topBorder = ' '.repeat(rowLabelWidth) + styles.board + boxChars.topLeft + (boxChars.horizontal.repeat(cellWidth - 1) + boxChars.teeTop).repeat(cols - 1) + boxChars.horizontal.repeat(cellWidth - 1) + boxChars.topRight + styles.reset;
    mapArray.push(topBorder);
    
    // Create each row of the grid
    for (let i = 0; i < rows; i++) {
      const rowLabel = styles.bold + styles.characters + this.numberToLetters(i + 1).padEnd(rowLabelWidth) + styles.reset;
      let row = `${rowLabel}${styles.board}${boxChars.vertical}${styles.reset}`;
  
      for (let j = 0; j < cols; j++) {
        let cellContent = this.map[i][j];
        let cellSymbol = cellContent === '' ? ' '.repeat(cellWidth - 1) : ` ${cellContent} `.padEnd(cellWidth - 1, ' ');
        row += `${cellSymbol}${styles.board}${boxChars.vertical}${styles.reset}`;
      }
  
      mapArray.push(row);
      
      // Add middle border if not the last row
      if (i < rows - 1) {
        const middleBorder = ' '.repeat(rowLabelWidth) + styles.board + boxChars.teeLeft + (boxChars.horizontal.repeat(cellWidth - 1) + boxChars.cross).repeat(cols - 1) + boxChars.horizontal.repeat(cellWidth - 1) + boxChars.teeRight + styles.reset;
        mapArray.push(middleBorder);
      }
    }
    
    // Create bottom border
    const bottomBorder = ' '.repeat(rowLabelWidth) + styles.board + boxChars.bottomLeft + (boxChars.horizontal.repeat(cellWidth - 1) + boxChars.teeBottom).repeat(cols - 1) + boxChars.horizontal.repeat(cellWidth - 1) + boxChars.bottomRight + styles.reset;
    mapArray.push(bottomBorder);
    
    return mapArray;
  }
}

export { GenerateMap };