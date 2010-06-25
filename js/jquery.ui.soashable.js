(function($) {



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


$.widget( "ui.soashable_im_window", $.ui.dialog, {
	options: {
		'partner' : null,
		'connection' : null
	},

	_create: function() {
		$.ui.dialog.prototype._create.call(this);

		this.option('title', 'Conversation with ' + this.options.partner);

		this.element.osw_conversation({
			'partner' : this.options.partner,
			'connection' : this.options.connection
		});
	}
});


})(jQuery);

