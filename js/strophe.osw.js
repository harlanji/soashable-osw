
Strophe.addConnectionPlugin('osw', (function() {


var connection;


var self = {

	OSW_NAMESPACES : {
		//'atom' : 'http://www.w3.org/2005/Atom',

		//'osw' : 'http://onesocialweb.org/spec/1.0/',
		//'activity' : 'http://activitystrea.ms/spec/1.0/',

		//'microblog' : 'urn:xmpp:microblog:0'	
	},

	JQUERY_NAMESPACES : {
		'httpbind' : 'http://jabber.org/protocol/httpbind',
		'client' : 'jabber:client',

		'pubsub' : 'http://jabber.org/protocol/pubsub',
		'atom' : 'http://www.w3.org/2005/Atom',

		'osw' : 'http://onesocialweb.org/spec/1.0/',
		'activity' : 'http://activitystrea.ms/spec/1.0/',

		'microblog' : 'urn:xmpp:microblog:0'	
	},


	init: function(conn) {
		connection = conn;

		$.each( self.OSW_NAMESPACES, function(k,v) {
			Strophe.addNamespace( k, v );
			$.xmlns
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
			connection.pubsub.items( jid, 
				options.who, 
				self.JQUERY_NAMESPACES.microblog, 
				function(iq) {
					received_osw_activities(iq, options);
				}, 
				received_osw_activities_error
			);
		}
	},

	statusChanged: connection_event,

};




function received_osw_activities(iq, options) {
	log('Got OSW activities!');

	$().xmlns( self.JQUERY_NAMESPACES, function() {

		$("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry", iq).each(function(i) {

			var activity = {
				id : $("atom|id", this).text(),
				title : $("atom|title", this).text(),
				published : $("atom|published", this).text(),

				verb : $("activity|verb", this).text(),
				'name' : $("activity|actor > atom|name", this).text(),
				jid : $("activity|actor > atom|uri", this).text(),

				acl : $("osw|acl-rule", this).map(function() { 
					return {
						'action': $("osw|acl-action", this).text(), 
						'subject': $("osw|acl-subject", this).attr("type")
					}; 
				}),

				objects : $("activity|object", this).map(function() { 
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
	
			options.cb(activity, options);


	/*
			$(objects).each(function(){
				if(this.objectType == 'http://onesocialweb.org/spec/1.0/object/status') {
				
				}


			});
	*/
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

