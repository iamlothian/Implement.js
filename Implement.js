/* Function.prototype.Implement - 0.2.1; Copyright (c) 2014, Matthew Lothian; http://www.opensource.org/licenses/MIT */
Function.prototype.Implement = function() {

  'use strict';
  
  var 
    implementContext = (Object.prototype.toString.call(this) === "[object Function]" && this.name != "Function") ? this : null
  , implamentList = Array.prototype.slice.call(arguments, 0)

  /*
    The compile phase does the brunt of the work, looping through the implamentList
    and implamenting the constructor functions on the this object. 

    As well as implamenting the __isInstanceOf__ and Extend functionality in the
    context of the newly implamented object.
  */
  , compile = function(capture_args, implementContext) {

    // keep list of constructors implamented
    var implaments = [];
    var _protected = null;

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

        var fn = undefined, thisArgs = undefined
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

        // remove access to the protected var scope  
        _protected = this._protected;
        delete this._protected; 

        // if constructor has prototype functions
        for (var method in fn.prototype) {

          // provide a closure for the proto funtion
          (function (fn_p) {

            // provide access to the prototype methods and pass in the protected variable _protected
            this.constructor.prototype[method] = (function(_protected) {          
              return function() {
                return fn_p.call(this, _protected);  
              }
            }); 

          }).call(this, fn.prototype[method]);

        }     
        
        // remember we implamented this constructor
        implaments.push(fn);
      
      }
    }

    // run protitype methods with the current _protected scope
    for (var method in this.constructor.prototype)
      this.constructor.prototype[method] = this.constructor.prototype[method](_protected);    

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
    };

    // remove __safe__ flag
    delete this.__safe__;
    return this;

  };

  // run
  var base = new function() { 
    this.__safe__ = true; 
  };

  return compile.call(
      base
    , implamentList
    , implementContext
  );

};
