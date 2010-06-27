(function($) {

/**
 * Find all properties of 'object' of the format ':event:query' and .bind
 * the associated function to an element that matches 'query' for 'event'.
 *
 * See ui.osw_conversation[':click:.send_message'] for an example.
 *
 * FIXME this should be a widget mixin or something.
 *
 */
$.osw_controller = function( widget ) {

	// bind all events
	$.each(widget, $.proxy(function(k, v) {
		var parts = k.split(':', 3);
		if( parts.length == 3 && parts[0] == '' ) {
			this.element.find( parts[2] ).bind( parts[1], $.proxy( v, this ) );
		}
	}, widget));
}



/**
 * This is a generic conversation view. It registers message and presence handlers
 * upon creation, which cause any relevent events to be displayed right away.
 * 
 * Requires: strophe.js, jquery.jqote2.js
 *
 * Options:
 * - partner (string, required, default: none.)
 *     The JID of the conversation partner. May be full or bare.
 * - connection (Strophe.Connection, required, default: none.)
 *     The StropheJS connection to use for sending/receiving packets.
 * - template (string|jQuery|lambda, default: #template_ui_osw_conversation)
 *     The jQuote2 template to use from the view. This must exist at the time of instantiation.
 *
 * Methods:
 * - none
 * 
 * Events: 
 * - none
 *
 * Example: 
 *  $("<div/>").osw_conversation( {partner: '...', connection: ... } );
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

		$.osw_controller( this );
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

// Not used for now.
$.widget( "ui.osw_roster", {
	options: {
		connection: null
	},

	_template: $.jqotec('<ul class="roster"></ul>'),
	_groupTemplate: $.jqotec('<li class="group" id="<%= this.id %>"><span class="name"><%= this.group_name %></span><ul class="entries"></ul></li>'),
	_entryTemplate: $.jqotec('<li class="entry" id="<%= this.id %>"><span class="alias"><%= this.alias %></span></li>'),
	
	_create: function() {

		this.options.connection.roster.registerCallback( $.proxy( this._receivedRoster, this ) );
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

	_receivedRoster: function(items, item) {
		try {
			if( !item ) { return; }

			osw.util.logger.debug( "Got roster item update" );
		} finally {
			return true;
		}
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


/**
 * A generic activity publisher. It simply has an input textbox and a button
 * that call the proper methods on the osw plugin.
 * 
 * Requires: strophe.osw.js
 *
 * Options:
 * - connection (Strophe.Connection, required, default: none.)
 *     The StropheJS connection to use for sending/receiving packets.
 * - template (string|jQuery|lambda, default: #template_ui_osw_activitypublish)
 *     The jQuote2 template to use from the view. This must exist at the time of instantiation.
 *
 * Methods:
 * - none
 * 
 * Events: 
 * - none
 *
 * Example: 
 *  $("<div/>").osw_activitypublish( {connection: ... } );
 */
$.widget("ui.osw_activitypublish", {
	'options' : {
		'connection' : null,
		'template' : '#template_ui_osw_activitypublish'
	},

	'_create' : function() {
		$(this.element).jqoteapp(this.options.template, {});

		$.osw_controller( this );
	},

	':submit:.form' : function() {
		try {
			var status = $(this.element).find(".status").val();
			$(this.element).find(".status").val('');

			this.options.connection.osw.publishActivity( osw.activity.create( status, [],  [ osw.acl.rule('grant', 'view', 'everyone') ]) );
		} finally {
			return false;
		}
	},

});



/**
 * Displays activities for all users that are currently subscribed to. It is designed
 * to have a template for each object type, as well as a main template. It should 
 * also have one for viewing an ACL.
 *
 * It registers events to update the view automatically through pubsub notices
 * and the inbox.
 * 
 * Requires: strophe.osw.js
 *
 * Options:
 * - connection (Strophe.Connection, required, default: none.)
 *     The StropheJS connection to use for sending/receiving packets.
 * - template (string|jQuery|lambda, default: #template_ui_osw_activityview)
 *     The jQuote2 template to use from the view. This must exist at the time of instantiation.
 * - activityTemplate (string|jQuery|lambda, default: #template_ui_osw_activityview_activity)
 *     The jQuote2 template to use from the view. This must exist at the time of instantiation.
 *
 * Methods:
 * - refresh()
 *     Clears the view and makes a new call to connection.osw.inbox(), which 
 *     then populate the view through the handlers.
 * - append(activity)
 *     Appends an activity to the view. JSON format as returned by the osw event.
 * 
 * Events: 
 * - none
 *
 * Example: 
 *  $("<div/>").osw_activityview( {connection: ... } );
 */
$.widget( "ui.osw_activityview", {
	'options' : {
		'connection' : null,
		'template' : '#template_ui_osw_activityview',
		'activityTemplate' : '#template_ui_osw_activityview_activity'
	},

	// TODO generalize. hash the type or something.
	'_objectTemplate': {
		'http://onesocialweb.org/spec/1.0/object/status': $.jqotec('<p>Status: <%= this.obj.status %></p>'),
		'http://onesocialweb.org/spec/1.0/object/picture': $.jqotec('<p>Picture: <%= this.obj.picture %></p>'),
		'' : $.jqotec('<p>Unknown object type: <%= this.obj.objectType %></p>'),
	},

	'_create' : function() {
		var self = this;

		$(this.element).jqoteapp( this.options.template ); 

		this.options.connection.osw.callbacks.received_activity.add( this._osw_activity_callback, this );

	},

	'_init' : function() {

	},

	'refresh' : function() {
		$(".activities", this).html("");

		this.options.connection.osw.inbox();
	},


	'append' : function(act) {
		var actId = MD5.hexdigest( act.id );		

		// add the activity to the beginning of the stream
		$(this.element).find(".activities").jqotepre(this.options.activityTemplate, {
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

	'_osw_activity_callback' : function( act ) {
		this.append( act );
	}
});


/*
Class: ui.osw_aclrulebuilder

	TODO document me.
*/
$.widget('ui.osw_aclrulebuilder', {
	'options' : {
		'connection' : null,
		'action' : 'view'
	},

	'_create' : function() {
		var widget = this;

		// permission selector
		var permissionSel = $('<select class="permission"></select>');
		$.each(osw.acl.permission, function(k, perm) {
			var opt = $('<option/>').val(perm).text(k);
			
			permissionSel.append( opt );
		});
		this.element.append(permissionSel);

		// subject type selector
		var subjectSel = $('<select class="subjectType"></select>');
		$.each(osw.acl.subjectType, function(k, st) {
			var opt = $('<option/>').val(st).text(k);
			
			subjectSel.append( opt );
		});
		
		// subject selector
		select.change(function(event) {
			var subjectType = $(event.target).find(':selected').val();
			var subjects = widget._calculateList( subjectType );

			var subjectSel;
			if( subjects.length > 0 ) {
				subjectSel = $('<select class="subject"></select>');
				$.each(subjects, function(i, subject) {
					var opt = $('<option/>').val(subject).text(subject);
					subjectSel.append( opt );
				});
			} else {
				subjectSel = $('<span class="subject"></span>');				
			}

			$(widget.element).find('.subject').replaceWith( subjectSel );
		});
		this.element.append(subjectSel);

		// placeholder for subject
		this.element.append( $('<span class="subject"></span>') );


		// accept button
		var acceptBtn = $('<button>Accept</button>');
		acceptBtn.click(function() {
			// FIXME make an event or something
			alert( Strophe.serialize( $(widget).osw_aclrulebuilder('rule') ) );
		});
		this.element.append(acceptBtn);
	},

	'rule' : function() {
		var permission = $(this.element).find('.permission > :selected').val();
		var subjectType = $(this.element).find('.subjectType > :selected').val();
		var subject = $(this.element).find('.subject > :selected').val();

		return osw.acl.rule( permission, this.options.action, subjectType, subject ); 
	},


	'_calculateList': function(subjectType) {
		switch(subjectType) {
			case 'user':
			case osw.acl.subjectType.user:
				return $.map(this.options.connection.roster.items, function(item) {
					return item.jid;
				});
				break;

			case 'group':
			case osw.acl.subjectType.group:
				// note: jQuery.map auto-flattens results.
				return $.unique( $.map(this.options.connection.roster.items, function(item) {
					return item.groups;
				}) );
				break;

			default:
				return [];
		}
	}

});

})(jQuery);

