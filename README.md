Implement.js
============

So in javascript you're used to doing this:

    var myObj = new function() { // constructor function };
    
But what if you wanted to combine multiple constructor functions into one object? Well that is the intent of Implements.js, to provide the meens to do so. 

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

There is much more to it than that though so i suggest you read:
[JavaScript constructors, prototypes, and the `new` keyword](http://pivotallabs.com/javascript-constructors-prototypes-and-the-new-keyword/)

NOTE: Implaments makes no assumption about your contructors, so you should write you own guard code. Here is an example:
[Basic JavaScript Part 4: Enforcing New on Constructor Functions](http://elegantcode.com/2010/12/21/basic-javascript-part-4-enforcing-new-on-constructor-functions/)

... Now that you are familiar with these consept, back to Implament.js. 

Getting started:
------------

What you would not have seen in those examples is something like this:

Object `c` implaments (in order) `a` and `b`

    var a = function(){
        this.propa = 'a';
    }
    var b = function(){
        this.propb = 'b'
    }
    var c = Function.Implement(a, b); // -> { propa: 'a', propb: 'b' }
    
`c` is a new object with the properties of both `a` and `b`. Notice the use of `Function` rather than `function`. The `Implement` function is a part of the base javascript Function prototype; any javascript function can be implamented.

The following syntax is also supported:

    var c = a.Implament(b); // -> { propa: 'a', propb: 'b' }

This is a little unintuitive though and is intended for anonymous function:

    var anon = (function(){
        ...
    })().Implament();
    
Arguments and Contructors Function:
------------

If a contructor function requires arguments use an array `[constructor, arg1, arg2, ...]` to specify the arguments:

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

Using the built in `instanceof` operator will not work on implamented functions as the resulting objects constructor is not a single function constructor. 

For this reason implamented function gain the `__InstanceOf__` method. This method gives you the ability to check weather an implamented object was created using a specific constructr function.

    c.__InstanceOf__(a)         // -> true
    c.__InstanceOf__(b)         // -> true
    c.__InstanceOf__(Function)  // -> true : every implamented object is an __InstanceOf__ Function
    
Extending Implamented Constructors:
------------
    
Implamented function also gain the `Extend` method, which is used to extend implamented function further.

    //...
    var d = c.Extend(function(){
        this.propb += 'd';
    });
    // -> { propa: 10, propb: 'bd' }
    
`d` is a new objcet that implaments the same constructors as `c` and extends `c` with any other constructor functions just as `Implement` would.

Notice `propa` is set to 10, this is because the implamentation arguments are remembered and used when implamenting `a` on `d`. once all of `c`'s constructors have been run, the extending constructors are run. In the above example the an anonymous constructor function is adding 'd' to the `propb` property set by the `b` constructor.
    
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
    p.prototype.getProtected = function(_protected) {
      return _protected;
    }
    p.prototype.showThis = function(_protected) {
      return this;
    }
    
    var withProto = p.Implement(function(){
        this._protected = { val: 10 };
    });
    
`p` defined two prototype methods `getProtected` and `showThis`, these will become available to any implementation or extention of `p`. The prototype funcations have access to the this scope of the implemented object and are also passed the `_protected` scope, this is explained next.

The `_protected` constructor function scope:
------------

The above example is making use of the `_protected` scope varaible in a contructor. The `_protected` scope is not passed up the constructor chain, only the `_protected` scope of the last constructor in the chain will be passed to the prototype functions.

To use, just define `this._protected = {...};` in your constructor function. When the constructor is implamented this property will not be visable.


Road Map
============

Things to do and improvments...
