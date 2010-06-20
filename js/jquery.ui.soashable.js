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

