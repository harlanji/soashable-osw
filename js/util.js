function delegate() {
	
}

delegate.prototype = {
	_fn : {},

	add: function(fn, context) {
		var handle;

		handle = uniqeRandom( this._fn.hasOwnProperty );

		if( context ) {
			var wrapped = fn;
			fn = function() {
				wrapped.apply( context, arguments );
			}
		}

		this._fn[ handle ] = fn;

	},

	remove: function(handle) {
		delete this._fn[ handle ];
	},

	trigger: function() {
		for( var handle in this._fn ) {
			this._fn[ handle ].apply( document, arguments );
		}
	}

}

/**
 * Returns a random number. defaults to max = INT32_MAX, min = 0.
 * Check function should return true if there is a collision.
 */
function uniqeRandom(checkFn, max, min) {
	var n;

	max = max || 0x7fffffff;
	min = min || 0;

	do {
		n = Math.floor( Math.random() * max ) + min;
	} while( checkFn(n) );
}
