/**
 * Module dependencies.
 */
var reactive = require('reactive');
var type = require('type');
var Differ = require('./differ')

/**
 * Expose `EachBinding`.
 */

exports = module.exports = EachBinding;
/**
 * Each Expression Regex
 * Based on Angular
 */

var expression = /^\s*((.+)\s+in\s+)?(.*?)\s*(\s+by\s+(.+)\s*)?$/; 

/**
 * Initialize an `each` binding for an element
 */

function EachBinding(el, binding, model) {
  var previousValue = [];
  var begin_tag = document.createComment('repeat start');
  var end_tag = document.createComment('repeat end');
  var items = [];
  var expr = binding.match(expression);
  var key = this.scope_name = expr[2];
  var name = expr[3];
  var track_name = this.hash_key = expr[5];

  console.log(key, name, track_name) 
  this.begin_tag = begin_tag;
  this.end_tag = this.end_tag;
  // hacky
  el.setAttribute('data-each-name', name)
  el.parentNode.insertBefore(begin_tag, el)
  el.parentNode.insertBefore(end_tag, el)
  el.removeAttribute(this.name)
  this.name = 'data-each-name'
  remove(el)
  this.differ = new Differ([], this.hash_key)
  this.hash_cache = {}
  this.items = [];
  // prevent further bindings from executing
  this.reactive.bindInterpolation = noop;
  this.reactive.bind = noop;
  /*this.change(function () {
    var currentValue = copyAsArray(this.value(name))
    items.forEach(remove)
    items = currentValue.map(function (value) {
      var template = el.cloneNode(true)
      var view = reactive(template, value, Object.create(this.view, {
        model: {
          writable: true,
          enumerable: false,
          value: value
        }
      }), this)
      end_tag.parentNode.insertBefore(template, end_tag)
      return template
    }, this)
  })*/
  this.change(onChange);
}

function onChange() {
  var values = this.value(this.el.getAttribute(name));
  var patch = this.differ.update(values || []);
  var nodes = [];
  var tmp = this.begin_tag.nextSibling;
  var hash_cache = []
  var el = this.el;
  while (tmp && tmp !== this.end_tag) {
    nodes.push(tmp)
    tmp = tmp.nextSibling;
  }
  var remove = patch.remove.concat(patch.move).sort(byOriginal);
  var insert = patch.insert.concat(patch.move).sort(byNew);
  remove.forEach(function (change) {
    var node = nodes[change[1]].parentNode.removeChild(nodes[change[1]])
    if (change[0] === "move") 
      hash_cache[change[1]] = node;
    nodes.splice(change[1], 1);
  });
  var parent = this.view
  insert.forEach(function (change) {
    var toInsert = null;
    if (change[0] !== "move") {
      toInsert = el.cloneNode(false);
      var model = values[change[2]];
      var view =  reactive(toInsert, model, Object.create(parent, {
        model: {
          value: model
        }
      }))
    } else {
      toInsert = hash_cache[change[1]]
    }
    nodes[change[2]].parentNode.insertBefore(toInsert, nodes[change[2]])
    nodes.splice(change[2], 0, change[3]);
  });
}

function byOriginal(a, b) {
    return b[1] - a[1];
}

function byNew(a, b) {
    return a[2] - b[2];
}

function hash(key, object) {
  if (object) return key && object[key] ? object[key] : object.valueOf();
  else return object;
}

function noop() {}
function remove(element) {
  if (element.parentNode) element.parentNode.removeChild(element)
  return element
}
function copyAsArray(value) {
  return Array.isArray(value) ? value.slice(0) : []
}

