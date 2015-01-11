
// #################
// using prototypes
// #################

var x = 1;
var xx = x;

var A = function A() {
  
  var _self = this;
  var _proto = this.constructor.prototype;
  _self.name = "A";
 
  _proto.getName = function(){
    return this.name;
  };
  
};

var B = function B() {
  
  var _self = this;
  var _proto = this.constructor.prototype;
  _self.name = "B";
 
  _proto.Speek = function(){
    return "Hello" + this.name;
  };

  var x = 1;

  _proto.age = function(){
    return x;
  };
  
};

var A1 = new A();
var A2 = A.Implement();
var A3 = Function.Implement(A, B);

var B = A3.Extend(function(){

  var _self = this;
  var _proto = this.constructor.prototype;
  _self.name = "BB";

  var x = 2;

})

console.log(A1, A1.getName());
console.log(A2, A2.getName());
console.log(A3, A3.getName());
console.log(B, B.getName());