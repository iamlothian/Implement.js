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

There is much more to it than that though so i suggest you read [this](http://pivotallabs.com/javascript-constructors-prototypes-and-the-new-keyword/)

Go. Read it now.

...

Welcome back!

Now back to Implament.js. What you would not have seen in those examples is something like this.

Object `c` implaments `a` and `b`

    var a = function(){
        this.propa = 'a';
    }
    var b = function(){
        this.propb = 'b'
    }
    var c = Function.Implement(a, b); // -> { propa: 'a', propb: 'b' }
    
Notice the use of `Function` rather than `function`. The `Implement` function is a part of the base javascript Function prototype; any javascript function can be implamented.




TODO: Write instructions, for now look at test.js
