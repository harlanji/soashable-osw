function delegate() {
	
}

delegate.prototype = {
	_fn : {},

	add: function(fn) {
		var handle;

		do {
			handle = Math.floor(Math.random() * 0x7fffffff);
		} while( this._fn.hasOwnProperty(k) );

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
