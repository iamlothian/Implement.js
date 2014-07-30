
describe("Function.Implement", function() {

	// BASIC TESTS
	it("Exists", function() {
		expect(!!Function.Implement).toBe(true);
	});

	it("can explicitly implement a single constructor", function() {
		var a = function() {
			this.prop = "prop";
		}
		var result = Function.Implement(a);
		expect(result.prop).toEqual("prop");
	});

	it("supplies a working __isInstanceOf__ for an single implemented constructor", function() {
		var a = function() {
			this.prop = "prop";
		}
		var result = Function.Implement(a);
		var pass = result.__isInstanceOf__(a);
		expect(pass).toBe(true);
	});


	// Constructor guarding
	describe("and Guarded Constructor 'a'", function() {
		
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
});

		