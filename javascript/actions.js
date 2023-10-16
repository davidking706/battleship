function convertStringToCoordinates(str) {
  const x = str.match(/[A-Z]+/ig)
  .join('')
  .toUpperCase()
  .charCodeAt(0) - 65;

  const y = Number(str.match(/\d+/ig)) - 1;

  return [x, y]
}

export { convertStringToCoordinates }