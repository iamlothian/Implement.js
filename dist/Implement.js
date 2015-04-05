/* Function.prototype.Implement - 0.3.1; Copyright (c) 2015, Matthew Lothian; http://www.opensource.org/licenses/MIT */
Function.prototype.Implement = function() {

  'use strict';

  var 
    implementContext = (Object.prototype.toString.call(this) === "[object Function]" && this.name !== "Function") ? this : null
  , implementList = Array.prototype.slice.call(arguments, 0)

  , isNativeCode = function(constructor){
      return (constructor.toString().split(/[\{\}]/g)[1].trim() === "[native code]" &&
        Object.prototype.toString.call(constructor) === "[object Function]" &&
        constructor.name !== "Function"); 
  }

  /*
    The compile phase does the brunt of the work, looping through the implementList
    and _implementing the constructor functions on the this object. 

    As well as _implementing the __isInstanceOf__ and Extend functionality in the
    context of the newly _implemented object.
  */
  , compile = function(capture_args, implementContext) {

    // keep list of constructors _implemented
    var _implements  = []
      //, _protected  = null  // track the protected scope
      //, __private   = null  // track the previous protected scope
      , thisProto   = Object.getPrototypeOf(this);

    // If we are implementing from a function bace 
    // then add it to the _implements and capture_args list
    if(!!implementContext) {
      _implements.unshift(implementContext);
      capture_args.unshift(implementContext);
    }
    
    // provide lookup check
    var __isInstanceOf__ = function(constructor) {
      var pass = false ||
      // any empty Function Object is an derived type
      (constructor.name === "Function" && constructor.prototype.name === "Empty") ||
      // check _implements list for constructor function
      (typeof constructor === 'function' && _implements.indexOf(constructor) >= 0);
      return pass;
    };

    // compile all constructor functions in the passed 
    // in (imp...list) capture_args into the this object
    for (var arg in capture_args) {
      if (capture_args.hasOwnProperty(arg)) {

        var fn, thisArgs;
        switch (Object.prototype.toString.call(capture_args[arg])) {
          // constructor fn stand alone
          case '[object Function]':
            fn = capture_args[arg];
            break;
            // constructor fn with capture_args // don't edit capture_args array
          case '[object Array]':
            fn = capture_args[arg][0];
            thisArgs = capture_args[arg].slice(1);
            break;
        }

        // add helper properties
        this.__safe__ = true;
        this.__isInstanceOf__ = __isInstanceOf__;

        // run constructor function on this object
        fn.apply(this, thisArgs);  
        
        // remember we _implemented this constructor
        _implements.push(fn);
      
      }
    }

    // provide object extend by reimplementing this object with more constructors
    this.Extend = function() {

      // support extending object where the base is a native object like "Array"
      var _base = isNativeCode(capture_args[0])? capture_args[0] : Function;

      // reimplement constructor chain
      var obj = Function.Implement.apply(_base, [].concat(
        capture_args,
        Array.prototype.slice.call(arguments, 0)
      ));

      // override __isInstanceOf__ for Extended objects
      var extending = _implements;
      var base__isInstanceOf__ = obj.__isInstanceOf__;
      obj.__isInstanceOf__ = function(constructor) {

        return false ||
        // check that all _implements are met by constructor object
        ((Object.prototype.toString.call(constructor) === "[object Object]" && !! constructor.__isInstanceOf__) &&
          (function() {
            for (var imp in extending) {
              if (!constructor.__isInstanceOf__(extending[imp])){
                return false;
              }
            }
            return true;
          })()) ||
          base__isInstanceOf__(constructor);

      };

      return obj;
    };

    // remove __safe__ flag
    delete this.__safe__;
    return this;

  };

  // the base of the new this object
  var base;
  // support baseing off native object like "Array"
  if (isNativeCode(this)) {
    base = new this();
  } else {
    // each Instance is new
    var Instance = function Instance() {};
    base = new Instance();
  }

  return compile.call(
      base
    , implementList
    , implementContext
  );

};
