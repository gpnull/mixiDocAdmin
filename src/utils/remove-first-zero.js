export function countRemoveFirstZeros(input) {
  let count = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "0") {
      break;
    }
    count++;
  }
  return count;
}
