var debug = require('debug')('reactive:priority')
  , Reactive = require('reactive')
  , _bindAll = Reactive.prototype.bindAll
  , _bind = Reactive.prototype.bind

module.exports = 
function ReactiveIterator(reactive) {
  reactive.iterator = iterator
  reactive.prototype.bindAll = bindAll(reactive)
  reactive.prototype.bindInterpolation = bindInterpolation
  reactive.iterators = {}
}

function iterator(name, fn) {
  this.iterators[name] = fn
}

function bindAll(reactive) {
  return function bindAll() {
    var iterators = reactive.iterators;
    var iterator = false;
    for (var name in iterators) {
      if (this.el.hasAttribute(name)) {
        iterator = true;
        this.bind(name, iterators[fn]);
      }
    }

    if (!iterator) {
      return _bindAll.call(this)
    }
  }
}
function bindInterpolation(el, els) {
  this.queue = this.queue || []
  this.queue.push()
}
