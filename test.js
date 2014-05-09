// basic test Function.prototype.Implament

// #################
// using Implement
// #################
var a = function() {
  // make sure we can't call this as a function, and that this 
  // is always an object
  if (!(( !! this && this.__safe__) || this instanceof a != 0))
    throw new Error();
  
  // keep a local reference to this
  // so it doesn't get lost in extension
  var self = this;

  self.a = 'a';
  var a = ',local a';
  self.fn = function() {
    console.log(self.a, a);
  }
}

var b = function(n) {
  if (!(( !! this && this.__safe__) || this instanceof b != 0))
    throw new Error();
  var self = this;
  self.propb = n;
}

var c = Function.Implement(a, [b, 10]);

console.log("\nc = Function.Implement(a,[b,10]):\n", c);
console.log(
  "\nc.__isInstanceOf__(a):" + c.__isInstanceOf__(a) // true
  , "\nc.__isInstanceOf__(b):" + c.__isInstanceOf__(b) // true
);

// #################
// extending and 
// implamented constructor
// #################
var d = c.Extend(function() {
  var self = this;
  var a = 'changed a';

  var basefn = this.fn;
  self.fn = function() {
    console.log(basefn);
    basefn();
  }

});

console.log("\nd = c.Extend(...):\n", d);
console.log(
  "\nd.__isInstanceOf__(a):" + d.__isInstanceOf__(a) // true
  , "\nd.__isInstanceOf__(b):" + d.__isInstanceOf__(b) // true
  , "\nd.__isInstanceOf__(c):" + d.__isInstanceOf__(c) // true
);

// #################
// using prototypes
// #################
var p = function() {
  if (!(( !! this && this.__safe__) || this instanceof p != 0))
    throw new Error();
  var self = this;

  // set arguments on the public scope to be passed to prototype
  self.arguments = arguments;
}
p.prototype = new function() {

  // make protected
  var _arguments = this.arguments;
  delete this.arguments;

  this.someFunc = function() {
    return _arguments;
  }
}

var withProto = Function.Implement([p, 'hello', 'world']);

console.log("\nwithProto = Function.Implement([p,'hello','world']):\n", withProto);
console.log(
  "\nwithProto.__isInstanceOf__(p):" + withProto.__isInstanceOf__(p) // true
);
