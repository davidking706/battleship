class CreateMap {
  constructor(dimensions) {
      this.currentIndex = 0;  // Start with index 0
      // If only one value is provided, interpret it as a request for a square grid
      if (dimensions.length === 1) {
          dimensions = [dimensions[0], dimensions[0]];
      }
      this.map = this.initializeGrid(dimensions);
  }

  initializeGrid(dimensions) {
      if (dimensions.length === 1) {
          // Create a 1D array filled with sequential index numbers
          let map = [];
          for (let i = 0; i < dimensions[0]; i++) {
              map.push(this.currentIndex++);
          }
          return map;
      } else {
          // Create a multidimensional array recursively
          let outerDimension = dimensions[0];
          let remainingDimensions = dimensions.slice(1);
          let map = [];
          for (let i = 0; i < outerDimension; i++) {
              map.push(this.initializeGrid(remainingDimensions));
          }
          return map;
      }
  }

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

  toString() {
      return JSON.stringify(this.map);
  }
}

// Example usage:
const map = new CreateMap([3]);
console.log(map);
