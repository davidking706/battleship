class CreateMap {
  constructor(dimensions) {
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

  createGrid(dimensions) {
    if (dimensions.length === 1) {
      let map = [];
      for (let i = 0; i < dimensions[0]; i++) {
        map.push(this.currentIndex++);
      }
      return map;
    } else {
      let outerDimension = dimensions[0];
      let remainingDimensions = dimensions.slice(1);
      let map = [];

      for (let i = 0; i < outerDimension; i++) {
        map.push(this.createGrid(remainingDimensions));
      }
      return map;
    }
  }

  // Adds a value to each index //
  setValue(coordinates, value) {
    let location = this.map;

    for (let i = 0; i < coordinates.length - 1; i++) {
      location = location[coordinates[i]];
    }

    location[coordinates[coordinates.length - 1]] = value;
  }

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

  toString() {
    return JSON.stringify(this.map);
  }
}

export { CreateMap };