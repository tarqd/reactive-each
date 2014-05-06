module.exports =
function lcs(array1, array2, head, tail) {
  head = head || 0
  tail = tail || 0
  // http://en.wikipedia.org/wiki/Longest_common_subsequence_problem
  var matrix = lengthMatrix(array1, array2, head, tail);
  var result = backtrack(matrix, array1, array2, array1.length, array2.length);
  if (typeof array1 == 'string' && typeof array2 == 'string') {
      result.sequence = result.sequence.join('');
  }
  return result;
}

function lengthMatrix(array1, array2, head, tail) {
  var len1 = array1.length;
  var len2 = array2.length;
  var x, y;
  // initialize empty matrix of len1+1 x len2+1
  var matrix = [len1 + 1];
  for (x = head; x < len1 - tail + 1; x++) {
      matrix[x] = [len2 + 1];
      for (y = head; y < len2 - tail + 1; y++) {
          matrix[x][y] = 0;
      }
  }
  // save sequence lengths for each coordinate
  for (x = head + 1; x < len1 - tail + 1; x++) {
      for (y = head + 1; y < len2 - tail + 1; y++) {
          if (array1[x - 1] === array2[y - 1]) {
              matrix[x][y] = matrix[x - 1][y - 1] + 1;
          } else {
              matrix[x][y] = Math.max(matrix[x - 1][y], matrix[x][y - 1]);
          }
      }
  }
  return matrix;
}

function backtrack(lenghtMatrix, array1, array2, index1, index2) {
  if (index1 === 0 || index2 === 0) {
      return {
          sequence: [],
          indices1: [],
          indices2: []
      };
  }

  if (array1[index1 -1] === array2[index2 - 1]) {
      var subsequence = backtrack(lenghtMatrix, array1, array2, index1 - 1, index2 - 1);
      subsequence.sequence.push(array1[index1 - 1]);
      subsequence.indices1.push(index1 - 1);
      subsequence.indices2.push(index2 - 1);
      return subsequence;
  }
  var length1 = 0;
  var length2 = 0;
  if (lengthMatrix[index1] !== undefined) {
    length1 = lengthMatrix[index1]
  }
  if (lengthMatrix[index1 - 1] !== undefined) {
    length2 = lengthMatrix[index -1][index2]
  }
  if (length1 > length2) {
      return backtrack(lenghtMatrix, array1, array2, index1, index2 - 1);
  } else {
      return backtrack(lenghtMatrix, array1, array2, index1 - 1, index2);
  }
}
