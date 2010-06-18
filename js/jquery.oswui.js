(function($) {




$.widget( "ui.osw_roster", {
	options: {
		connection: null,
_uiGroups : {},
	},
	
	_create: function() {

		this.options.connection.roster.registerCallback( this._received_roster );
	},
	_init: function() {

	},
	destroy: function() {
		
	},


	group: function(group_name, create_options) {
		if( !this.options._uiGroups.hasOwnProperty( group_name ) ) {
			// FIXME script injection...
			var grp = this.element.append( $("<div class='group'></ul>").osw_rostergroup(create_options) );

			this.options._uiGroups[ group_name ] = grp;
		}

		return this.options._uiGroups[ group_name ];
	},

	_received_roster: function(items) {
		alert("got roster");
	}

});

$.widget( "ui.osw_rostergroup", {
	options: {
		connection: null,
		group_name: null
	},
	_create: function() {
		// $(groupEl).osw_roster.group('remove')
		// $(groupEl).osw_roster.group('remove')

		var label = $("<span class='group'></span>");
		label.text(options.group_name);

		var entryList = $("<ul class='entries'></ul>");
	},
	_init: function() {

	},
	destroy: function() {

	}

});

$.widget( "ui.osw_rosteritem", {
	options: {
		connection: null
	},
	_create: function() {
		// $(groupEl).osw_roster.group('remove')
		// $(groupEl).osw_roster.group('remove')

		alert(this.element);

		
		//return $("<ul class='group'></ul>");
	},
	_init: function() {

	},
	destroy: function() {

	}

});

$.widget( "ui.osw_activityview", {
	options: {
		connection: null,
	},
	_create: function() {
		this.element.append($("<div class='activities'></div>")); 
	},
	_init: function() {

	},
	destroy: function() {

	},

	refresh: function() {
		$(".activities", this).html("");

		this.options.connection.osw.activities.get('harlan@osw1.soashable.com',
			$.proxy(this._osw_activity_callback, this));
	},


	append: function(act) {
		
		var html = "<div><p>Activity by " + act.name + " (" + act.jid + "): " + act.title + ". contains " + act.objects.length + " objects and " + act.acl.length + " ACL rules.</p>";

		$.each(act.objects, function(i, obj) {
			switch(obj.objectType) {
				case 'http://onesocialweb.org/spec/1.0/object/status':
					html += "<p>Status: " + obj.status + "</p>";
					break;

				case 'http://onesocialweb.org/spec/1.0/object/picture':
					html += "<p>Picture: " + obj.picture + "</p>";
					break;
			}
		});
		html += "<hr/></div>";

		$(".activities", this.element).append( $( html ) );

	},

	_osw_activity_callback: function( act, options ) {
		this.append( act );
	}
});

})(jQuery);

