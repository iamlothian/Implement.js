/* Polyfill Object.setPrototypeOf */
Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
  obj.__proto__ = proto;
  return obj; 
};
/* Polyfill Object.getPrototypeOf */
Object.getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__; 
};

/* Function.prototype.Implement - 0.2.2; Copyright (c) 2014, Matthew Lothian; http://www.opensource.org/licenses/MIT */
Function.prototype.Implement = function() {

  'use strict';

  var 
    implementContext = (Object.prototype.toString.call(this) === "[object Function]" && this.name !== "Function") ? this : null
  , implamentList = Array.prototype.slice.call(arguments, 0)

  , isNativeCode = function(constructor){
      return (constructor.toString().split(/[\{\}]/g)[1] === " [native code] " &&
        Object.prototype.toString.call(constructor) === "[object Function]" &&
        constructor.name !== "Function"); 
  }

  /*
    The compile phase does the brunt of the work, looping through the implamentList
    and implamenting the constructor functions on the this object. 

    As well as implamenting the __isInstanceOf__ and Extend functionality in the
    context of the newly implamented object.
  */
  , compile = function(capture_args, implementContext) {

    // keep list of constructors implamented
    var implaments  = []
      , _protected  = null  // track the protected scope
      , __private   = null  // track the previous protected scope
      , thisProto   = Object.getPrototypeOf(this);

    // If we are implamenting from a function bace 
    // then add it to the implaments and capture_args list
    if(!!implementContext) {
      implaments.unshift(implementContext);
      capture_args.unshift(implementContext);
    }
    
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

        // run constructor function on this object
        fn.apply(this, thisArgs);

        // moves the previous protected scope to the next constructor
        __private = _protected;

        // remove access to the protected var scope  
        _protected = this._protected;
        delete this._protected; 

        // if constructor has prototype functions
        for (var method_signiture in fn.prototype) {
          // make sure this proto funtion hasn't already been proxied
          if (fn.prototype[method_signiture].name !== 'proxy_proto') { 
            // provide a closure for the proto funtion
            (function (fn_p) {
              // provide a proxy access to the prototype method that accepts the current context of execution
              thisProto[method_signiture] = (function proxy_proto(_protected, __private) { 
              //this.constructor.prototype[method_signiture] = (function proxy_proto(_protected, __private) { 
                // this function is what will be called when you request the prototype[method_signiture]       
                return function() {
                  var args = Array.prototype.slice.call(arguments, 0);
                  // calls the original prototype with this context
                  return fn_p.call(this, _protected, __private, args);  
                };
              }); 
            }).call(this, fn.prototype[method_signiture]);
          }
        }     
        
        // remember we implamented this constructor
        implaments.push(fn);
      
      }
    }

    // run prototype proxy methods with the current _protected and __private context
    for (var proto_method_signiture in thisProto){
      if (Object.prototype.toString.call(thisProto[proto_method_signiture]) === "[object Function]"){
        thisProto[proto_method_signiture] = thisProto[proto_method_signiture](_protected, __private); 
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

      // support extending object where the base is a native object like "Array"
      var _base = isNativeCode(capture_args[0])? capture_args[0] : Function;

      // reimplement constructor chain
      var obj = Function.Implement.apply(_base, [].concat(
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
  var base = {};
  // support baseing off native object like "Array"
  if (isNativeCode(this)) {
    base = new this();
  } else {
    base = Object.create({ __safe__: true });
  }

  return compile.call(
      base
    , implamentList
    , implementContext
  );

};
