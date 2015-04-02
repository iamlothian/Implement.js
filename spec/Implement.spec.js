
describe("Function.Implement", function() {

	it("Exists", function() {
		expect(!!Function.Implement).toBe(true);
	});

	// basic functionality
	describe("basic functionality", function() {

		it("can explicitly implement a single constructor", function() {
			var a = function() {
				this.prop = "prop";
			}
			var result = Function.Implement(a);
			expect(result.prop).toEqual("prop");
		});

		it("can implicitly implement a single constructor", function() {
			var a = function() {
				this.prop = "prop";
			}
			var result = a.Implement();
			expect(result.prop).toEqual("prop");
		});

		it("supplies a working __isInstanceOf__ for an single implemented constructor", function() {
			var a = function() {
				this.prop = "prop";
			}
			var result = Function.Implement(a);
			var pass = result.__isInstanceOf__(a);
			expect(pass).toBe(true);
			expect(result.prop).toEqual("prop");
		});

	});

	// Constructor guarding
	describe("guarded constructor 'a'", function() {
		
		var a = function() {
			// make sure we can't call this as a function, and that this 
			// is always an object	
			if (!(( !! this && this.__safe__) || this instanceof a != 0)){
				throw "Guard Triggered";
			}

			this.prop = "prop";
		}

		var a_f 	= function(){ return a(); };
		var a_call 	= function(){ return a.call({}); };
		var a_new 	= function(){ return new a(); };

		// test guard
		it("should fail when called as: a()", function() { 
			expect(a_f).toThrow(); 
		});
		it("should fail when called as: a.call({})", function() { 
			expect(a_call).toThrow(); 
		});
		it("should pass when called as: new a()", function() { 
			expect(a_new).not.toThrow(); 
		});

		it("should pass and be implemented with: Function.Implement(a)", function() {
			var result = Function.Implement(a);
			var pass = result.__isInstanceOf__(a);

			expect(result.prop).toEqual("prop");
			expect(pass).toBe(true);
		});

	});

	// multiple constructors
	describe("multiple constructors (constructor chain) can be implemented", function() {		
		var a = function() {
			this.propa = "a";
			this.overridme = 1;
		}
		var b = function() {
			this.propb = "b";
			this.overridme = 2;
		}
		var result = Function.Implement(a, b);

		it("and inheriting their public values", function() {
			expect(result.propa).toEqual("a");
			expect(result.propb).toEqual("b");
		});
		it("are an instanceof both constructors", function() {
			expect(result.__isInstanceOf__(a)).toBe(true);
			expect(result.__isInstanceOf__(b)).toBe(true);
		});
		it("override public values in constructor chain in order", function() {
			expect(result.overridme).toEqual(2);
		});

	});

	// constructor arguments
	describe("constructors requiering arguments", function() {		
		var a = function(arg) {
			this.prop = arg;
		}
		var arg = 1;
		var result = Function.Implement([a,arg]);

		it("can be implemented with passed in values at implamentation time", function() {
			expect(result.__isInstanceOf__(a)).toBe(true);
			expect(result.prop).toEqual(arg);
		});

	});

	// Extend
	describe("implemented constructors can be extended", function() {		
		var a = function(arg) {
			this.prop = arg;
		};
		var arg = 1;
		var a_imp = Function.Implement([a,arg]);
		var a_extended = a_imp.Extend();

		it("and will retain all constructor signitures of child implementations", function() {
			expect(a_extended.__isInstanceOf__(a)).toBe(true);
		});

		it("and will retain all constructor arguments values from child implementations", function() {
			expect(a_extended.prop).toBe(arg);
		});

	});

	/*
	// prototypes
	describe("constructors with prototypes", function() {

		var p = function() {
			var self = this;
			self._protected = 1
			self.prop = 3;
		};
		p.prototype.getProtected = function(_protected, __private, _args) {
		  return _protected;
		};
		p.prototype.getPrivate = function(_protected, __private, _args) {
		  return __private;
		};
		p.prototype.getArguments = function(_protected, __private, _args) {
		  return _args;
		};
		p.prototype.testThis = function(_protected, __private, _args) {
		  return this.prop === 3 && this.__isInstanceOf__(p);
		};

		it("prototypes are not global", function(){
			expect(Object.getProtected).toBeUndefined();
		});

		var withProto = p.Implement(function(){
			// anonymous implementation
		    this._protected = 2;
		});

		it("can be implemented like normal constructor functions", function(){
			expect(withProto.__isInstanceOf__(p)).toBe(true);
		});

		it("the _protected property is not public after implamentation", function(){
			expect(withProto._protected).toBeUndefined();
		});

		it("the prototypes have been implemented", function(){
			expect(withProto.getProtected).toBeDefined();
			expect(withProto.getPrivate).toBeDefined();
			expect(withProto.testThis).toBeDefined();
		});

		it("the prototypes have access to the _protected property", function(){
			var result = withProto.getProtected();
			expect(result).toBeDefined();
			expect(result).toBe(2);
		});

		it("the prototypes have access to the __private property", function(){
			var result = withProto.getPrivate();
			expect(result).toBeDefined();
			expect(result).toBe(1);
		});

		it("the prototypes have access to the 'this' scope", function(){
			var result = withProto.testThis();
			expect(result).toBeDefined();
			expect(result).toBe(true);
		});

		it("the prototypes has access to arguments passed to it", function(){
			var result = withProto.getArguments('arg');
			expect(result).toBeDefined();
			expect(result[0]).toEqual('arg');
		});

	});
	*/

	describe("constructors with prototypes", function() {

		var P = (function(){

			// prototype methods
			var _PlussPluss = (function PlussPluss() {
				var count = 0;								// <-- INTERNAL STATE
				return function(){							
					count ++;								// <-- EACH CALL UPDATES STATE
					return count;
				};
			})();

			var _GetThis = function GetThis() {
				return this
			};

			// expose constructor function
			return function() {
				var self = this;
				var proto = this.constructor.prototype;
				self._protected = 1
				self.prop = 3;

				// by moving the prototype methods outside the 
				// constructor we can ensure that they will 
				// not be redefined each time
				proto.GetThis = _GetThis;
				proto.PlussPluss = _PlussPluss;
			};

		})();		

		it("prototypes are not global", function(){
			expect(Object.getThis).toBeUndefined();
		});

		var withProto1 = P.Implement();
		var withProto2 = Function.Implement(P);

		it("can be implemented like normal constructor functions", function(){
			expect(withProto1.__isInstanceOf__(P)).toBe(true);
			expect(withProto2.__isInstanceOf__(P)).toBe(true);
		});

		it("the prototypes have been implemented", function(){
			expect(withProto1.GetThis).toBeDefined();
			expect(withProto1.PlussPluss).toBeDefined();
			expect(withProto2.GetThis).toBeDefined();
			expect(withProto2.PlussPluss).toBeDefined();
		});

		var withProtoExtended = withProto1.Extend();

		it("prototypes are carried to Extended instances", function(){
			expect(withProtoExtended.GetThis).toBeDefined();
			expect(withProtoExtended.PlussPluss).toBeDefined();
		});

		it("can share internal state accross multiple instances", function(){

			// here the PlussPluss method is being called on 3 distinct instances
			// and the state of the method is preservced accross implementations
			expect(withProto1.PlussPluss()).toBe(1)
			expect(withProto2.PlussPluss()).toBe(2)
			expect(withProtoExtended.PlussPluss()).toBe(3)

		});

	});


});

		