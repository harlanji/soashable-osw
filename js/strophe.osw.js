




Strophe.addConnectionPlugin('osw', (function() {


var $aclr = function(perm, action, subjectType, subject) {
	return $build('acl-rule', {xmlns: self.JQUERY_NAMESPACES.osw})
		.c('acl-action', {permission: perm})
			.t( action ).up()
		.c('acl-subject', {type: subjectType}).t( subject ? subject : '' ).up()
		.tree();
}

$aclr.parse = function(node) {

	var rule;

	$().xmlns( self.JQUERY_NAMESPACES, function() {
		rule = {
			'action': $("osw|acl-action", node).text(), 
			'subjectType': $("osw|acl-subject", node).attr("type"),
			'subject': $("osw|acl-subject", node).text(),
			'permission': $(node).attr("permission")
		}
	}); 

	return rule;
}

$aclr.permission = {
	'grant' : 'http://onesocialweb.org/spec/1.0/acl/permission/grant',
	'deny' : 'http://onesocialweb.org/spec/1.0/acl/permission/deny'
}

$aclr.action = {
	'view' : 'http://onesocialweb.org/spec/1.0/acl/action/view',
	'update' : 'http://onesocialweb.org/spec/1.0/acl/action/update'
}

$aclr.subject = {
	'everyone' : 'http://onesocialweb.org/spec/1.0/acl/subject/everyone',
	'user' : 'http://onesocialweb.org/spec/1.0/acl/subject/user',
	'group' : 'http://onesocialweb.org/spec/1.0/acl/subject/group'
	
}



var connection;


var self = {
	JQUERY_NAMESPACES : {
		'httpbind' : 'http://jabber.org/protocol/httpbind',
		'client' : 'jabber:client',

		'pubsub' : 'http://jabber.org/protocol/pubsub',
		'pubsubevt' : 'http://jabber.org/protocol/pubsub#event',
		'atom' : 'http://www.w3.org/2005/Atom',

		'osw' : 'http://onesocialweb.org/spec/1.0/',
		'activity' : 'http://activitystrea.ms/spec/1.0/',

		'microblog' : 'urn:xmpp:microblog:0'
	},



	callbacks: {
		'received_activity' : new delegate(),
	},

	init: function(conn) {
		connection = conn;

		$.each( self.JQUERY_NAMESPACES, function(k,v) {
			Strophe.addNamespace( k, v );
			//$.xmlns
		});

		conn.addHandler(this._receivedMessage_Activity, null, "message", "headline", null, null, null);
	},


	_receivedMessage_Activity: function(msg) {
		try {		
			$(msg).xmlns( self.JQUERY_NAMESPACES, function() {

				var entries = this.find("pubsubevt|event > pubsubevt|items > pubsubevt|item > atom|entry");
				if( entries.length > 0 ) {
					entries.each(function(i, entry) {
						var activity = self._parseActivity( entry );

						self.callbacks.received_activity.trigger( activity );
					});
				}
			});
		// ensure callback doesn't disappear upon error.
		} finally {
			return true;
		}
	},



	activities: function(who){
		// FIXME should !who get inbox() instead?

		connection.pubsub.items( connection.jid, 
			who, 
			self.JQUERY_NAMESPACES.microblog, 
			this._receivedActivities, 
			this._receivedActivitiesError
		);
	},

	_receivedActivities: function(iq) {
		$(iq).xmlns( self.JQUERY_NAMESPACES, function() {
			this.find("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry").each(function(i, entry) {
				var activity = self._parseActivity( entry );

				self.callbacks.received_activity.trigger( activity );
			});
		});
	},

	_receivedActivitiesError: function(iq) {
		
	},


	publishActivity: function(status) {
		var pubId = connection.getUniqueId("publishnode");

		var pubsubEl = $build('pubsub', {xmlns: self.JQUERY_NAMESPACES.pubsub})
			.c('publish', {node: self.JQUERY_NAMESPACES.microblog})
				.c('item')
					.c('entry', {xmlns: self.JQUERY_NAMESPACES.atom, 'xmlns:activity' : self.JQUERY_NAMESPACES.activity})
						.c('title').t( status ).up()
						.c('activity:verb').t( 'http://activitystrea.ms/schema/1.0/post' ).up()
						.c('object', {xmlns: self.JQUERY_NAMESPACES.activity})
							.c('object-type').t('http://onesocialweb.org/spec/1.0/object/status').up()
							.c('content', {xmlns: self.JQUERY_NAMESPACES.atom,type: 'text/plain'}).t( status ).up().up()
						/*.cnode($aclr(
							$aclr.permission.grant,
							$aclr.action.view,
							$aclr.subject.group,
							'friends'
						))*/
						.cnode($aclr(
							$aclr.permission.grant,
							$aclr.action.view,
							$aclr.subject.everyone
						))
			.tree();

		var iqEl = $iq({
				type:'set', 
				id: pubId
			}).cnode( pubsubEl )
			.tree();

		console.dirxml( iqEl );


		connection.sendIQ( iqEl, function(iq) {
			alert( "posted successfully");

			console.dirxml( iq );
		},
		function(iq) {
			alert("post error");

			console.dirxml( iq );
		});

	},


	/**
	 * Parse an activity from an ATOM entry node. It is such because pubsub has
	 * multiple namespaces that contain activities--I've encountered /pubsub
	 * and /pubsub#events.
	 */
	_parseActivity: function(entry) {

		var activity;

		$(entry).xmlns( self.JQUERY_NAMESPACES, function() {
			
				activity = {
					'id' : this.find("atom|id").text(),
					'title' : this.find("atom|title").text(),
					'published' : this.find("atom|published").text(),

					'verb' : this.find("activity|verb").text(),
					'name' : this.find("activity|actor > atom|name").text(),
					'jid' : this.find("activity|actor > atom|uri").text(),

					'acl' : this.find("osw|acl-rule").map(function() { 
						return $aclr.parse(this);
					}),

					'objects' : this.find("activity|object").map(function() { 
						var obj = {
							'id': $(this).find("id").text(),
							'published': $(this).find("atom|published").text(),
							'objectType': $(this).find("activity|object-type").text()
						}; 

						// TODO make modular
						switch(obj.objectType) {
							case 'http://onesocialweb.org/spec/1.0/object/status':
								obj.status = $(this).find("atom|content").text();
								break;

							case 'http://onesocialweb.org/spec/1.0/object/picture':
								obj.picture = $(this).find("html|link[rel='alternate']").attr("href");
								break;
						}

						return obj;
					}),
				};
		});

		return activity;

	},

    /**
     * Function: inbox
     * 
     * List the inbox of activities for the current user.
     **/
    inbox : function() {

		// FIXME logger
		var logger = connection.logger;

		var sub = $iq({
			'from' : connection.jid, 
			'type' : 'get'
		}).c('pubsub', {
			'xmlns': self.JQUERY_NAMESPACES.pubsub 
		}).c('items', {
			'node' : 'http://onesocialweb.org/spec/1.0/inbox'
		});
		connection.sendIQ(sub.tree(), self._receivedInbox, function(st) {
			logger.error('Unable to send IQ to receive activities');
			logger.debug(st);
		});
    },

	_receivedInbox: function(iq) {
		$(iq).xmlns( self.JQUERY_NAMESPACES, function() {
			this.find("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry").each(function(i, entry) {
				var activity = self._parseActivity( entry );

				self.callbacks.received_activity.trigger( activity );
			});
		});
	},

	_receivedInboxError: function(iq) {
		
	},

	/**
	 * Get a list of all users subscribed to the PEP microblog.
	 * 
	 */
	subscriptions : function() {
		connection.sendIQ($iq({
			'from': connection.jid, 
			'type': 'get'
		}).c('pubsub', { 
			'xmlns': self.JQUERY_NAMESPACE.pubsub
		}).c('subscriptions', { 
			'xmlns': self.JQUERY_NAMESPACE.pubsub,
			'node': self.JQUERY_NAMESPACE.microblog
		}).tree(), callbacks.subscription);
    },

	statusChanged: function (status, condition) {

	}

};


return self;

})());

