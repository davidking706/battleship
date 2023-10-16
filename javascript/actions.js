function convertStringToCoordinates(str) {
  const separation = str.match(/([A-Z]+|\d+)/ig);

  if (/[A-Z]+/ig.test(str)) {
    return separation.map((value) => {
      if (isNaN(value)) {
        return value.split('').reverse().map((char, charIndex) => 
          (char.toUpperCase().charCodeAt(0) - 64) * (26 ** charIndex)
        ).reduce((acc, curr) => acc + curr) - 1;
      } else {
        return parseInt(value, 10) - 1;
      }
    });
  } else {
    return separation.map(value => parseInt(value, 10))
  }
}

export { convertStringToCoordinates }