(function($) {


$.widget( "ui.soashable_conversation", {

	'options' : {
		'connection' : null,
		'partner' : null,
		'template' : '#template_ui_soashable_conversation'
	},

	'_create' : function() {
		// create elements
		this.element.jqotepre( this.options.template, {
			partner: this.options.partner
		});

		// register all protocol handlers
		var handlers = [
			//this.options.connection.addHandler( this._messageReceived, null, "message", "chat", null, null, null),
			//this.options.connection.addHandler( this._presenceReceived, null, "presence", null, null, null, null)
		];

		this.element.data('handlers', handlers);

		// bind all events
		$.each(this, $.proxy(function(k, v) {
			var parts = k.split(':', 3);
			if( parts.length == 3 && parts[0] == '' ) {
				this.element.find( parts[2] ).bind( parts[1], $.proxy( v, this ) );
			}
		}, this));
	},

	'destroy' : function() {
		var handlers = this.element.data('handlers');

		$.each(handlers, $.proxy(function(i, h) {
			this.options.connection.removeHandler( h );
		}, this));
	},

	':click:.send_message' : function(event, ui) {
		var body = this.element.find(".outgoing_text").val();

		var msg = $msg({
			'to' : this.options.partner,
			'body' : body,
			'type' : 'chat'
		});

		this.options.connection.send(msg);

		// cleanup.
		this.element.find(".outgoing_text").val('');
	},

	'_messageReceived' : function(msg) {

	},

	'_presenceReceived' : function(pres) {

	}

});

$.widget( "ui.soashable_chatbar", {
	options: {
		connection: null
	},
	_uiRoster: null,
	_create: function() {
		this.element.append($("<button class='edit-lists'>Edit Lists</button>").click(function() {

		}));
		this.element.append($("<button class='options'>Options</button>").click(function() {

		}));

		this._uiRoster = $("<ul class='roster'></ul>").osw_roster({
			connection: this.options.connection
		});

		this.element.append( this._uiRoster );
	},
	_init: function() {

	},
	destroy: function() {

	}
});



$.widget( "ui.soashable_im", {
	options: {
		partner: null,
		connection: null
	},

	_create: function() {
		//this.element.append( "<div class='
	},

	destroy: function() {

	},

	append: function(msg) {
		

	}
});


})(jQuery);

