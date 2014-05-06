var lcs = require('./lcs')

exports = module.exports = Differ;

function Differ(values, key) {
  this.hash_key = key
  this.hashes = hash_collection(values, key)
}

Differ.prototype.update = function(values) {
  var previous = this.hashes;
  var current = hash_collection(values, this.hash_key);
  var head = 0;
  var tail = 0;
  var diff = {"remove": [], "insert": [], "move": []}
  // calculate common head
  for (; head < previous.length && head < current.length; head++) {
    if (previous[head] !== current[head]) break;
  }
  // calculate common tail
  for (; head + tail < previous.length && head + tail < current.length; tail++) {
    if (previous[tail] !== current[tail]) break;
  }
  var common_length = head + tail;
  var is_same_length = previous.length === current.length;
  
  // arrays are the same
  if (is_same_length && common_length === previous.length) return diff;
  // trivial case, items were appended
  if (head + tail === previous.length) {
    for (var i = head; i < current.length - tail; i++) {
      console.log('trivally append')
      diff.insert.push(['insert', -1, i, values[i], current[i]]);
    }
    // trival case, items were removed
  } else if (head + tail === current.length) {
    for (var i = head; i < previous.length - tail; i++) {
      console.log('trivial remove')
      diff.remove.push(['remove', i, -1 , null, previous[i]]);
    }
  } else {
      var seq = lcs(previous, current, values);
      // check for removals
      for (var i = head; i < previous.length - tail; i++) {
        if (seq.indices1.indexOf(i) < 0) {
          diff.remove.push(['remove', i, -1, null, previous[i]])
        }
      }

      for (var i = head; i < current.length - tail; i++) {
        var currentIndex = seq.indices2.indexOf(i);
        if (currentIndex < 0) {
          var is_move = false;
          if (diff.remove.length > 0) {
            for (var removedIndex = 0; removedIndex < diff.remove.length; removedIndex++) {
              if (previous[diff.remove[removedIndex][1]] === current[i]) {
                diff.move.push(['move', diff.remove[removedIndex][1], i, values[i], current[i]])
                is_move = true;
                diff.remove.splice(removedIndex, 1);
                break;
              }
            }
          }
          if (!is_move) {
            diff.insert.push(["insert", currentIndex, i, current[i], values[i]]);
          }
        }
      }
    }
     
  this.hashes = current;
  return diff;

}

function hash_collection(object, key) {
  return object.map(hash.bind(null, key));
}

function hash(key, object) {
  if (object) {
    var value = get(key, object)
    return value ? value : object.valueOf();
  }
}

function get(key, object) {
  var value = object[key] ? object[key] : (object.get && object.get(key))
  return 'function' === typeof value ? value.call(object) : value
}


function apply(arr, patch) {
  var remove = patch.remove.concat(patch.move).sort(byOriginal);
  var insert = patch.insert.concat(patch.move).sort(byNew);
  remove.forEach(function (change) {
    arr.splice(change[1], 1);
  });

  insert.forEach(function (change) {
    arr.splice(change[2], 0, change[3]);
  })
  return arr
}

function byOriginal(a, b) {
  return b[1] - a[1];
}

function byNew(a, b) {
  return a[2] - b[2];
}
