




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


	init: function(conn) {
		connection = conn;

		$.each( self.JQUERY_NAMESPACES, function(k,v) {
			Strophe.addNamespace( k, v );
			//$.xmlns
		});


		conn.addHandler(received_message, null, 'message', null, null,  null); 
	},

	activities: {
		get: function(who, cb) {

			var options = {
				'who' : who,
				'cb' : cb
			}

			// jid,service,node,ok_callback,error_back
			connection.pubsub.items( connection.jid, 
				options.who, 
				self.JQUERY_NAMESPACES.microblog, 
				function(iq) {
					received_osw_activities(iq, options);
				}, 
				received_osw_activities_error
			);
		}
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

		// FIXME global jid
		var iqEl = $iq({
				//from: connection.jid, 
				//to: jid, 
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
		




/*
		// FIXME global jid
		connection.pubsub.publish( jid, 
			connection.getBareJidFromJid( jid),
			self.JQUERY_NAMESPACES.microblog,
			[entry],
			function() {
			
			} );
*/

	},


	_parseActivity: function(entry) {

		var activity;

		$().xmlns( self.JQUERY_NAMESPACES, function() {
			
				activity = {
					id : $("atom|id", entry).text(),
					title : $("atom|title", entry).text(),
					published : $("atom|published", entry).text(),

					verb : $("activity|verb", entry).text(),
					'name' : $("activity|actor > atom|name", entry).text(),
					jid : $("activity|actor > atom|uri", entry).text(),

					acl : $("osw|acl-rule", entry).map(function() { 
						return $aclr.parse(this);
					}),

					objects : $("activity|object", entry).map(function() { 
						var obj = {
							'id': $("id", this).text(),
							'published': $("atom|published", this).text(),
							'objectType': $("activity|object-type", this).text()
						}; 

						switch(obj.objectType) {
							case 'http://onesocialweb.org/spec/1.0/object/status':
								obj.status = $("atom|content", this).text();
								break;

							case 'http://onesocialweb.org/spec/1.0/object/picture':
								obj.picture = $("html|link[rel='alternate']", this).attr("href");
								break;
						}

						return obj;
					}),
				};
;
		});

		return activity;

	},

	statusChanged: connection_event,

};




function received_osw_activities(iq, options) {
	log('Got OSW activities!');

	$().xmlns( self.JQUERY_NAMESPACES, function() {
		$("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry", iq).each(function(i, entry) {
			var activity = self._parseActivity( entry );

			options.cb(activity, options);
		});
	});
	
}


function received_osw_activities_error(iq) {
	log('Error getting OSW activities :(');
}

function received_message(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
	var body = elems[0];

	log('ECHOBOT: I got a message from ' + from + ': ' + 
	    Strophe.getText(body));
    
	var reply = $msg({to: from, from: to, type: 'chat'})
            .cnode(Strophe.copyElement(body));
	connection.send(reply.tree());

	log('ECHOBOT: I sent ' + from + ': ' + Strophe.getText(body));
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}

function connection_event(status, condition) {

}


return self;

})());

