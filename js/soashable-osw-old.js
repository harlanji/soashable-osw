var BOSH_SERVICE = '/bosh';
var connection = null;
var jid = null;




function log(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}



function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
	log('Strophe is connected.');
	log('ECHOBOT: Send a message to ' + connection.jid + 
	    ' to talk to me.');

	//connection.addHandler(onOswActivities, 'http://jabber.org/protocol/pubsub', 'iq', 'result', null, null );


	connection.addHandler(onMessage, null, 'message', null, null,  null); 
	connection.send($pres().tree());

	//connection.pubsub.createNode( jid, jid, 'urn:xmpp:microblog:0', options, onOswCreateNodeResponse );



	// jid,service,node,ok_callback,error_back
	connection.pubsub.items( jid, 'harlan@osw1.soashable.com', 'urn:xmpp:microblog:0', onOswActivities, onOswActivitiesErr );

	//connection.sendIQ( $iq({'to': jid,  }).tree(), onOswActivities, onOswActivitiesErr );
    }
}

function onOswActivities(iq) {
	log('Got OSW activities!');

	$().xmlns({
		'httpbind' : 'http://jabber.org/protocol/httpbind',
		'client' : 'jabber:client',

		'pubsub' : 'http://jabber.org/protocol/pubsub',
		'atom' : 'http://www.w3.org/2005/Atom',

		'osw' : 'http://onesocialweb.org/spec/1.0/',
		'activity' : 'http://activitystrea.ms/spec/1.0/'	
	}, function() {

		$("pubsub|pubsub > pubsub|items > pubsub|item > atom|entry", iq).each(function(i) {
			var title = $("atom|title", this).text();
			var published = $("atom|published", this).text();

			var verb = $("activity|verb", this).text();
			var actorName = $("activity|actor > activity|name", this).text();
			var actorJid = $("activity|actor > activity|uri", this).text();

			var aclRules = $("osw|acl-rule", this).map(function() { 
				return {
					'action': $("osw|acl-action", this).text(), 
					'subject': $("osw|acl-subject", this).attr("type")
				}; 
			});

			var objects = $("activity|object", this).map(function() { 
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
			});
	

			log("Activity by " + actorName + " (" + actorJid + "): " + title + ". contains " + objects.length + " objects and " + aclRules.length + " ACL rules." );
			$.each(objects, function(i, obj) {
				switch(obj.objectType) {
					case 'http://onesocialweb.org/spec/1.0/object/status':
						log("Status: " + obj.status );
						break;

					case 'http://onesocialweb.org/spec/1.0/object/picture':
						log("Picture: " + obj.picture );
						break;
				}
			});

	/*
			$(objects).each(function(){
				if(this.objectType == 'http://onesocialweb.org/spec/1.0/object/status') {
				
				}


			});
	*/
		});

	});
	
}

function onOswActivitiesErr(iq) {
	log('Error getting OSW activities :(');
}

function onMessage(msg) {
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

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    // Uncomment the following lines to spy on the wire traffic.
    //connection.rawInput = function (data) { log('RECV: ' + data); };
    //connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };


    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
	    button.value = 'disconnect';

		jid = $('#jid').get(0).value;

	    connection.connect(jid,
			       $('#pass').get(0).value,
			       onConnect);
	} else {
	    button.value = 'connect';
	    connection.disconnect();

		jid = null;
	}
    });
});


AppService = function() {
	var db = {
	};

	var self = this;

	jQuery.each({
		register: function(app) {
			var info = app.info;

			db[ info.id ] = info;
		},
		unregister: function(id) {
			db[ id ] = undefined;

		},
		get: function(id) {
			return db[ id ];
		},
		list: function() {

		}
	}, function(k, fn) {
		self[ k ] = fn;
	});
};

ServiceService = function() {
	var db = {
		'service' : this
	};

	var self = this;

	jQuery.each({
		register: function(id, instance) {

			if( typeof(id) == 'object' ) {
				jQuery.each(id, function(k, service) {
					self.register(k, service);
				});
			}

			db[ id ] = instance;
		},
		unregister: function(appid) {
			db[ id ] = undefined;

		},
		get: function(id) {
			return db[ id ];
		},
		list: function() {
			
		}
	}, function(k, fn) {
		self[ k ] = fn;
	});
};


MessageService = function() {
	var listeners = {

	};

	var nextHandle = 0;
	var self = this;

	jQuery.each({
		broadcast: function(id, body) {
			if( !listeners[ id ] ) {
				return;
			}

			jQuery.each( listeners[ id ], function() {
				this.cb( id, body );
			});

		},
		listen: function(id, cb) {
			if( !listeners[ id ] ) {
				listeners[ id ] = {};
			}
			var handle = ++nextHandle;

			listeners[ id ][ handle ] = { 'callback' : cb };

			return handle;
		},
		unlisten: function(id, handle) {
			// TODO unlisten by handle only...
			listeners[ id ][ handle ] = undefined;
		}
	}, function(k, fn) {
		self[ k ] = fn;
	});
};


StropheConnectionService = function() {
	var strophe;
	var self = this;

	jQuery.each({
		init: function(soash) {
			var msgs = soash.services.get('message');

			msgs.listen( 'SEND_PACKET', function(id, body) {
				strophe.send( body );
			});

			msgs.listen( 'SEND_IQ', function(id, body) {
				strophe.sendIQ( body.packet, body.callback, body.errback, body.timeout );
			});
		},
		connect: function(boshUrl, login, password) {
			strophe = new Strophe.Connection(boshUrl);
		},
		close: function() {
			strophe.disconnect();

		},

		strophe: function() {
			return strophe;
		}
	}, function(k, fn) { 
		self[ k ] = fn;
	});
};

EchoApp = function() {

	function log(msg)
	{
		jQuery('#log').append('<div></div>').append(document.createTextNode(msg));
	}

	this.init = function( soash ) {
		var msgs = soash.services.get( 'message' );
		var con = soash.services.get( 'connection' );

		//con.strophe().
	}

}

EchoApp.info = {
	'id' : 'ECHOAPP',
	'name' : 'Echo App',
	'version' : '0.1',
	'publisher' : 'soashable.com',

	'sends_messages' : [
	],

	'consumes_messages' : [
		'MESSAGE_RECEIVED'
	],

	'requires_services' : [
	]
}



ActivitiesApp = function() {

}

ActivitiesApp.info = {

}

StatusApp = function() {

}

StatusApp.info = {

}


$soash = (function() {

	var services = new ServiceService;

	services.register({
		'app' : new AppService,
		'message' : new MessageService,
		'connection' : new StropheConnectionService,
	});

	services.get('app').register([
		//ActivitiesApp.info,
		//StatusApp.info,
		EchoApp
	]);

	return {
		'services' : services,
	}

})();


