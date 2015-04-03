
// implements a new custome element
var iElement = (function(){

	var tagName = "i_element";

	return function iElement () {

		// make sure we can't call this as a function, and that this 
		// is always an object
		if (!(( !! this && this.__safe__) || this instanceof iElement != 0))
			throw new Error("Incorrect use of instance constructor function");

		if (!document && !document.createElement)
			throw new Error("No document object found");

		var self = this;
		var proto = this.constructor.prototype;

		// make new element for each instance;
		this.element = document.createElement(tagName);

	};

})();

// addeds box styles to an element
var BoxStyles = (function(){

	return function BoxStyles (w, h, color, margin) {

		// make sure we can't call this as a function, and that this 
		// is always an object
		if (!(( !! this && this.__safe__) || this instanceof BoxStyles != 0))
			throw new Error("Incorrect use of instance constructor function");

		if(!this.__isInstanceOf__(iElement))
			throw new Error("Expected ancestor to be iElement instance");

		var self = this;
		var proto = this.constructor.prototype;

		this.element.style.display = "block";
		this.element.style.width = w || 0;
		this.element.style.height = h || 0;
		this.element.style.backgroundColor = color || "black";
		this.element.style.margin = margin || 0;

	};

})();

// adds click handler to element
var Clickable = (function(){

	return function Clickable (handler) {

		// make sure we can't call this as a function, and that this 
		// is always an object
		if (!(( !! this && this.__safe__) || this instanceof BoxStyles != 0))
			throw new Error("Incorrect use of instance constructor function");

		if(!this.__isInstanceOf__(iElement))
			throw new Error("Expected ancestor to be iElement instance");

		var self = this;
		var proto = this.constructor.prototype;

		this.element.addEventListener('click', handler);

	};

})();

var E1 = iElement.Implement(
	[BoxStyles, 100, 100, "Red", 5]
);

var E2 = E1.Extend(
	[Clickable, function(e){ alert("clicked"); }]
);

var E3 = iElement.Implement(
	[BoxStyles, 200, 100, "green"],
	[Clickable, function(e){ alert("clicked the green one"); }]
);

// add our new element to the dom
window.onload = function(){

	document.body.appendChild(E1.element);
	document.body.appendChild(E2.element);
	document.body.appendChild(E3.element);

}