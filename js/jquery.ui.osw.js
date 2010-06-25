(function($) {

/*

osw_roster

Options:
- connection (Strophe.Connection, default: null)
	- more details

Methods:
- addgroup( group, [...])
	- descriptions
	- details on args, type, behavior

Events:
- someEvent
	- description of when triggered
	- description of cancellable
		-what happens when cancelled



*/


$.widget( "ui.osw_conversation", {

	'options' : {
		'connection' : null,
		'partner' : null,
		'template' : '#template_ui_osw_conversation'
	},

	'_create' : function() {
		// create elements
		this.element.jqotepre( this.options.template, {
			partner: this.options.partner
		});

		// register all protocol handlers
		var handlers = [
			this.options.connection.addHandler( $.proxy(this._messageReceived, this), null, "message", "chat", null, null, null),
			this.options.connection.addHandler( $.proxy(this._presenceReceived, this), null, "presence", null, null, null, null)
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
			'type' : 'chat'
			}).c('body').t( body );

		this.options.connection.send( msg.tree() );

		// cleanup.
		this.element.find( '.incoming_text' ).append( '<div>You: ' + body + '</div>' );
		this.element.find(".outgoing_text").val('');
	},

	'_messageReceived' : function(msg) {
		try {
			// FIXME script injection may be possible.
			this.element.find( '.incoming_text' ).append( '<div>Them: ' + $(msg).find('body').text()+'</div>' );
		} finally {
			return true;
		}
	},

	'_presenceReceived' : function(pres) {
		try {
			// FIXME script injection may be possible.
			this.element.find( '.incoming_text' ).append( '<div>Presence: ' + $(pres).attr('type')+'</div>' );
		} finally {
			return true;
		}
	}

});


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

$.widget("ui.osw_activitypublish", {
	options: {
		connection: null,
	},

	_template: $.jqotec('<div class="wtf"><form class="activity-publish"><input type="text" class="status" name="status"/><input type="submit" class="submit" name="submit" value="submit"/></form></div>'),

	_create: function() {
		var self = this;

		$(this.element).jqoteapp(this._template, {});

		$(this.element).find(".activity-publish").submit(function() {
			try {
				var status = $(this).find(".status").val();
				$(this).find(".status").val('');

				self.options.connection.osw.publishActivity( status );
			} finally {
				return false;
			}
		});
	},

	_clickedPublish: function() {

	}
});


$.widget( "ui.osw_activityview", {
	options: {
		connection: null,
	},

	_activityTemplate: $.jqotec('<div class="activity" id="<%= this.id %>"><p>Activity by <%= this.act.name %> (<%= this.act.jid %>): <%= this.act.title %>. contains <%= this.act.objects.length %> objects and <%= this.act.acl.length %> ACL rules.</p><div class="objects"></div></div>'),

	_objectTemplate: {
		'http://onesocialweb.org/spec/1.0/object/status': $.jqotec('<p>Status: <%= this.obj.status %></p>'),
		'http://onesocialweb.org/spec/1.0/object/picture': $.jqotec('<p>Picture: <%= this.obj.picture %></p>'),
		'' : $.jqotec('<p>Unknown object type: <%= this.obj.objectType %></p>'),
	},

	_create: function() {
		var self = this;

		this.element.append($("<div class='activities'></div>")); 

		this.options.connection.osw.callbacks.received_activity.add( this._osw_activity_callback, this );

	},
	_init: function() {

	},
	destroy: function() {

	},

	refresh: function() {
		$(".activities", this).html("");

		this.options.connection.osw.inbox();
	},


	append: function(act) {
		var actId = MD5.hexdigest( act.id );		

		// add the activity to the beginning of the stream
		$(this.element).find(".activities").jqotepre(this._activityTemplate, {
			id: actId,
			act: act
		});

		
		$.each(act.objects, $.proxy(function(i, obj) {
			var template = this._objectTemplate.hasOwnProperty( obj.objectType ) ?
				obj.objectType : '';

			// attach the object to the activity.
			$("#" + actId + " > .objects").jqoteapp( this._objectTemplate[ template ], {
				obj: obj
			});
		}, this));
	},

	_osw_activity_callback: function( act ) {
		this.append( act );
	}
});

})(jQuery);

