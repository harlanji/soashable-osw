function delegate() {
	
}

delegate.prototype = {
	_fn : {},

	add: function(fn, context) {
		var handle;

		do {
			handle = Math.floor(Math.random() * 0x7fffffff);
		} while( this._fn.hasOwnProperty(handle) );

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
