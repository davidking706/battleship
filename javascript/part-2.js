import * as rs from 'readline-sync';

const MAX = 20;
const MIN = 3;
let value = 10;
let key;

console.log('[A] <- -> [D]  FIX: [SPACE] \n');

while (true) {
  console.log('\x1B[1A\x1B[K|' +
    (new Array(value - 2)).join('-') + 'O' +
    (new Array(MAX - value + 1)).join('-') + '| ' + value);
  key = rs.keyIn('',
    {hideEchoBack: true, mask: '', limit: 'ad '});
  if (key === 'a') { if (value > MIN) { value--; } }
  else if (key === 'd') { if (value < MAX) { value++; } }
  else { break; }
}

console.log('\nA value the user requested: ' + value);
