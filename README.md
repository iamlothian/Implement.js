Implement.js
============

A minimal javascript module pattern with constructor chain management.

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

*NOTE*: Implements makes no assumption about your contractors, so you should write you own guard code. Here is an example:
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
    
Arguments and Contractor Functions:
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

For this reason implemented function gain the `__InstanceOf__` method. This method gives you the ability to check weather an implemented object was created using a specific constructor function.

    c.__InstanceOf__(a)         // -> true
    c.__InstanceOf__(b)         // -> true
    c.__InstanceOf__(Function)  // -> true : every implamented object is an __InstanceOf__ Function
    
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
    
`__InstanceOf__` will also work on extended objects

    d.__InstanceOf__(a)         // -> true
    d.__InstanceOf__(b)         // -> true
    d.__InstanceOf__(c)         // -> true
    d.__InstanceOf__(Function)  // -> true
    
Implaments and Function prototype:
------------

Don't want to have methods instanced onto every object? Try this:

    var p = function() {
      if (!(( !! this && this.__safe__) || this instanceof p != 0))
        throw new Error();
      var self = this;
      ...
    }
    p.prototype.getProtected = function(_protected, __private) {
      return _protected;
    }
    p.prototype.showThis = function(_protected, __private) {
      return this;
    }
    
    var withProto = p.Implement(function(){
        this._protected = { val: 10 };
    });
    
`p` defined two prototype methods `getProtected` and `showThis`, these will become available to any implementation or extension of `p`. The prototype functions have access to the `this` scope of the implemented object and are also passed the current `_protected` scope and the previous `_protected` scope as `__private`, this is explained next.

The `_protected` constructor function scope:
------------

The above example is making use of the `_protected` scope variable in a constructor. Only the `_protected` scope of the last constructor in the chain will be passed to the prototype functions. The `_protected` scope of the previous constructor in  up the constructor chain to the 2nd prototype argument. 

To use, just define `this._protected = {...};` in your constructor function. When the constructor is implemented this property will not be visible.

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

Another thing to node is `var self = this;` will alias or enclose the current this scope of your constructor, so that any detached functions will not loose there scope if passed around outside the constructor.

Road Map
============

Things to do and improvements...
