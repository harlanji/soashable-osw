(function($) {


// Not used for now.
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

/**
 * This widget extends the jQuery UI Dialog class and represents a 
 * full IM window. In the future it may be demoted to be a pane that
 * can be used in tab-views and whatnot. 
 *
 * This widget uses the osw_conversation widget and delegates appropreiate
 * options.
 * 
 * Requires: jquery.ui.osw.js
 *
 * Options:
 * - partner (string, required, default: none.)
 *     The JID of the conversation partner. May be full or bare.
 * - connection (Strophe.Connection, required, default: none.)
 *     The StropheJS connection to use for sending/receiving packets.
 *
 * Methods: (also see ui.dialog)
 * - none
 * 
 * Events: (also see ui.dialog)
 * - none
 *
 * Example: 
 *  $("<div/>").soashable_im_window( {partner: '...', connection: ... } );
 */

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

