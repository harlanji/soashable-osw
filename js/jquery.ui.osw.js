(function($) {




$.widget( "ui.osw_roster", {
	options: {
		connection: null
	},

	_template: $.jqotec('<ul class="roster"></ul>'),
	_groupTemplate: $.jqotec('<li class="group" id="<%= this.id %>"><span class="name"><%= this.group_name %></span><ul class="entries"></ul></li>'),
	_entryTemplate: $.jqotec('<li class="entry" id="<%= this.id %>"><span class="alias"><%= this.alias %></span></li>'),
	
	_create: function() {

		this.options.connection.roster.registerCallback( this._received_roster );
	},
	_init: function() {
		$(this.element).jqotesub( this._template, {} );
	},
	destroy: function() {
		
	},


	addgroup: function(group) {
		return $(this.element)
			.jqoteapp( this._groupTemplate, {
			id: this._groupElId(group),
			group_name: group
		} );
	},

	addentry: function(group, jid) {
		return $( '#' + this._groupElId(group) + " > .entries" )
			.jqoteapp( this._entryTemplate, {
				id: this._entryElId(group, jid),
				alias: jid
			});
	},

	groupEl: function(group) {
		return $( '#' + this._groupElId(group) );
	},

	entryEl: function(group, jid) {
		return $( '#' + this._entryElId(group, jid) );
	},

	_received_roster: function(items) {
		alert("got roster");
	},

	_groupElId: function(group) {
		// TODO find a fast hashing function
		return MD5.hexdigest("group." + group);
	},
	_entryElId: function(group, jid) {
		// TODO find a fast hashing function
		return MD5.hexdigest("entry." + group + "." + jid);
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

