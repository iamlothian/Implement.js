Implement.js
============

What is it?
-----------

Implement.js is a minimal javascript module pattern with constructor chain management, filling a gap in the (already saturated) marked of javascript "things". 

Surprisingly this pattern and functionality has not been sufficiently covered yet. Implement.js isn't trying to shadow or implement any other language. The goal is to take the powerful and somewhat messy things of javascript, like prototypes, constructor functions and multiple inheritances, and make them easy and simple to manage.

***

So in javascript you're used to doing this:

    var myObj = new function() { // constructor function };
    
But what if you wanted to combine multiple constructor functions into one object? Well that is the intent of Implements.js, to provide the means to do so. 

Let's start very simple:
------------

What are constructor functions?

    var a = function(){
        this.property = 'hello world';
    }
    
A constructor function is any function intended to be called with the `new` operator.

    var b = new a(); // -> { property: 'hello world' }
    
`b` is a new object that has all the properties defined by `a`

Now you're knee deep:
------------

If you're not familiar with the concepts of prototypal javascript then I suggest some reading:

There is much more to it than that though so i suggest you read:
[JavaScript constructors, prototypes, and the `new` keyword](http://pivotallabs.com/javascript-constructors-prototypes-and-the-new-keyword/)

A summary of common inheritance patterns, some employed by this framework: 
[javascript-inheritance-patterns](http://davidshariff.com/blog/javascript-inheritance-patterns/)

*NOTE*: Implements makes no assumption about your constructors, so you should write you own guard code. Here is an example:
[Basic JavaScript Part 4: Enforcing New on Constructor Functions](http://elegantcode.com/2010/12/21/basic-javascript-part-4-enforcing-new-on-constructor-functions/)

... Now that you are familiar with these consept, back to Implament.js. 

Getting started:
------------

What you would not have seen in those examples is something like this:

Object `c` implements (in order) `a` and `b`

    var a = function(){
        this.propa = 'a';
    }
    var b = function(){
        this.propb = 'b'
    }
    var c = Function.Implement(a, b); // -> { propa: 'a', propb: 'b' }
    
`c` is a new object with the properties of both `a` and `b`. Notice the use of `Function` rather than `function`. The `Implement` function is a part of the base javascript Function prototype; any javascript function can be implemented.

The following syntax is also supported:

    var c = a.Implement(b); // -> { propa: 'a', propb: 'b' }

This is a little unintuitive though and is intended for anonymous function:

    var anon = (function(){
        ...
    })().Implement();
    
Arguments and Constructor Functions:
------------

If a constructor function requires arguments use an array `[constructor, arg1, arg2, ...]` to specify the arguments:

    var a = function(n){
        this.propa = n;
    }
    var b = function(){
        this.propb = 'b'
    }
    var c = Function.Implement([a, 10], b); // -> { propa: 10, propb: 'b' }
    //...
    
Instance Checking:
------------

Using the built in `instanceof` operator will not work on implemented functions as the resulting objects constructor is not a single function constructor. 

For this reason implemented function gain the `__isInstanceOf__` method. This method gives you the ability to check weather an implemented object was created using a specific constructor function.

    c.__isInstanceOf__(a)         // -> true
    c.__isInstanceOf__(b)         // -> true
    c.__isInstanceOf__(Function)  // -> true : every implamented object is an __isInstanceOf__ Function
    
Extending Implemented Constructors:
------------
    
Implemented function also gain the `Extend` method, which is used to extend implemented function further.

    //...
    var d = c.Extend(function(){
        this.propb += 'd';
    });
    // -> { propa: 10, propb: 'bd' }
    
`d` is a new object that implements the same constructors as `c` and extends `c` with any other constructor functions just as `Implement` would.

Notice `propa` is set to 10, this is because the implementation arguments are remembered and used when implementing `a` on `d`. once all of `c`'s constructors have been run, the extending constructors are run. In the above example the an anonymous constructor function is adding 'd' to the `propb` property set by the `b` constructor.
    
`__isInstanceOf__` will also work on extended objects

    d.__isInstanceOf__(a)         // -> true
    d.__isInstanceOf__(b)         // -> true
    d.__isInstanceOf__(c)         // -> true
    d.__isInstanceOf__(Function)  // -> true
    
Constructor guarding and `this.__safe__`:
------------

During the construction phase of implementation you might want to provide a guard to stop you constructor being called as a normal function. This is usually accomplished via  `this instanceof [Function name]` within the constructor, but implements does not always use the `new` operator to create your constructor.

For this reason, during the construction phase the `this` object will contain a  `__safe__` property set to true, if the function was implemented by Implement.js. 

The following is an example that check that: 
* The `this` object is not undefined or null
* And check that `this.__safe__` is set
* Or `this` is an instanceof myThing

If any of these fail the error will be thrown

    var myThing = function() {
        // constructor Guard
        if (!(( !! this && this.__safe__) || this instanceof myThing != 0))
            throw new Error('Constructor Guard Error');
            
        // this aliasing
        var self = this;
        self.someProp = 'hello world'
    }
    
    new myThing()            // -> Pass     
    myThing()                // -> Fail
    myThing.call(null)       // -> Fail
    myThing.call(undefined)  // -> Fail
    myThing.call(this)       // -> Fail
    
Don't do this, Implement.js will do it for you.
    
    var myThis = {__safe__:true};
    myThing.call(myThis);   // -> Pass
    myThis                  // -> {__safe__:true, someProp:'hello world'}

Another thing to note is `var self = this;` will alias or enclose the current this scope of your constructor, so that any detached functions will not loose there scope if passed around outside the constructor.

Constructor & Prototypes
============

It is possible to add prototype functions to constructor functions in a way that will allow them to be implemented and extended

    // constructor function
    var A = function A() {
        //...
        var _self = this;
        // keep reference to this prototype
        var _proto = this.constructor.prototype;
        _self.name = "A";
     
        // add function to prototype
        _proto.getName = function(){
            // use 'this' reference so that prototype function is portable
            return this.name;
        };
        //...
    };

NOTE: When the prototype method is defined inside the constructor function it will be recreated for each instance. If you want to create prototype methods that share state accross instances, you can do this using an anonymous wrapper function.

	var P = (function(){
    
		// prototype methods
		var _PlussPluss = (function PlussPluss() {
			var count = 0;								// <-- INTERNAL STATE
			return function(){							
				count ++;								// <-- EACH CALL UPDATES STATE
				return count;
			};
		})();

		// expose constructor function
		return function() {
			var self = this;
			var proto = this.constructor.prototype;

			// by moving the prototype methods outside the 
			// constructor we can ensure that they will 
			// not be redefined each time
			proto.PlussPluss = _PlussPluss;
		};

	})();

Native Object Types
============

You can extends and implent using native objects like `Array` and  `String` by using the explicit implementation method

    Array.Implement(function(){...}, ...);

Road Map
============

Things to do and improvements...
