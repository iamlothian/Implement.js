/* Function.prototype.Implement - 0.1.0; Copyright (c) 2014, Matthew Lothian; http://www.opensource.org/licenses/MIT */
Function.prototype.Implement = function() {

  'use strict';

  var base = (
    Object.prototype.toString.call(this) === "[object Function]" &&
    this.name != "Function") ?
    new this : {
      __safe__: true
  };

  return (function(args) {

    // keep lost of constructors implamented
    var implaments = [],
      capture_args = Array.prototype.slice.call(args, 0);

    // run constructors on this object
    for (var arg in args) {
      if (args.hasOwnProperty(arg)) {
        var fn = undefined,
          thisArgs = undefined
        switch (Object.prototype.toString.call(args[arg])) {
          // constructor fn stand alone
          case '[object Function]':
            fn = args[arg];
            break;
            // constructor fn with args // don't edit args array
          case '[object Array]':
            fn = args[arg][0];
            thisArgs = args[arg].slice(1);
            break;
        }
        fn.apply(this, thisArgs);
        if (fn.prototype.constructor != fn) // apply prototype if different
          fn.prototype.constructor.call(this);
        implaments.push(fn);
      }
    }

    // provide lookup check
    this.__isInstanceOf__ = function(constructor) {
      var pass = false ||
      // any empty Function Object is an derived type
      (constructor.name === "Function" && constructor.prototype.name === "Empty") ||
      // check implaments list for constructor function
      (typeof constructor === 'function' && implaments.indexOf(constructor) >= 0);
      return pass;
    };

    // provide object extend by reimplamenting this object with more constructors
    this.Extend = function() {
      var obj = Function.Implement.apply(Function, [].concat(
        capture_args,
        Array.prototype.slice.call(arguments, 0)
      ));

      // override __isInstanceOf__ for Extended objects
      var extending = implaments;
      var base__isInstanceOf__ = obj.__isInstanceOf__;
      obj.__isInstanceOf__ = function(constructor) {

        return false ||
        // check that all implaments are met by constructor object
        ((Object.prototype.toString.call(constructor) === "[object Object]" && !! constructor.__isInstanceOf__) &&
          (function() {
            for (var imp in extending) {
              if (!constructor.__isInstanceOf__(extending[imp]))
                return false;
            }
            return true;
          })()) ||
          base__isInstanceOf__(constructor);

      };

      return obj;
    }

    delete this.__safe__;
    return this;

  }).call(base, arguments);

};
