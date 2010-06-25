var BOSH_SERVICE = '/bosh';
var connection = null;
var jid = null;






function log(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}


function connection_event(status, condition)
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
		log('ECHOBOT: Send a message to ' + connection.jid + ' to talk to me.');

		connection.send($pres().tree());

		$("#activities .activity-view").osw_activityview('refresh');
		$("#activities").dialog('open');

		$('#login').dialog('close');



		// TODO abstract widget and dialog integration.
		$("<div/>").appendTo( 'body' )
			.soashable_im_window({
				'partner' : connection.jid,
				'connection' : connection,
				'autoOpen' : true
			});
    }
} 





/*
connection.osw.activities('get', {
	who: 'harlan@osw1.soashable.com',
	cb: osw_activity_callback
});
*/


(function($) {



})(jQuery);




var connection;





$(document).ready(function () {

	var login_win = $($('#tpl_login').jqote({
		default_jid: 'test1@osw1.soashable.com',
		default_pass: 'test1',
		id: 'login'
	})).dialog({
		title: 'Soashable OSW Login',
		position: ['center', 'middle'],

		open: function(event, ui) {
			$('#connect').bind('click', function () {
				var button = $('#connect', event.target).get(0);
				if (button.value == 'connect') {
					button.value = 'disconnect';

					jid = $('#jid', event.target).get(0).value;

					connection.connect(jid,
						$('#pass', event.target).get(0).value,
						connection_event);
				} else {
					button.value = 'connect';
					connection.disconnect();

					jid = null;
				}
			});
		}

	});



	var log_win = $($('#tpl_log').jqote({
		id: 'log'
	})).dialog({
		title: 'Log Events',
		position: ['left', 'top']
	});

	var activityview_win = $("#activities").dialog({
		title: 'Activity Stream',
		position: ['center', 'middle'],
		autoOpen: false,
		height: 400
	});


	$(".roster-items").treeList({
		onSelect: function() {
			alert("selected! "+$(this).treeList('selected').text() );
		}
	});


/*
	$("#roster").treeview({
		persist: "location",
		collapsed: false,
		unique: true
	});
*/

	



	connection = new Strophe.Connection(BOSH_SERVICE);

	$(".chat-bar").soashable_chatbar({connection: connection});
	$("#activities .publish-view").osw_activitypublish({connection: connection});
	$("#activities .activity-view").osw_activityview({connection: connection});


	//connection.addHandler( received_message, 'message', null, null, null, null );

	// Uncomment the following lines to spy on the wire traffic.
	//connection.rawInput = function (data) { log('RECV: ' + data); };
	//connection.rawOutput = function (data) { log('SEND: ' + data); };

	// Uncomment the following line to see all the debug output.
	//Strophe.log = function (level, msg) { log('LOG: ' + msg); };



});



