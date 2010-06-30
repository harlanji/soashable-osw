var BOSH_SERVICE = '/bosh';
var connection = null;
var jid = null;






function log(msg) 
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}




var connection;

var connection_callback = {
	connection: function(status) {
	    $('#connect').get(0).value = status;
	},
	connected: function() {
	    connection.send($pres().tree());
	    $("#activities .activity-view").osw_activityview('refresh');
	    $("#roster").dialog({
		title: 'Contacts',
		height: 400
	    });
	    $('#roster .body').osw_roster('refresh');
	    $("#activities").dialog('open');
	    $('#login').dialog('close');
	    $("#menu").dialog('open');
	}
    };



$(document).ready(function () {

    
    
	var login_win = $($('#tpl_login').jqote({
		default_jid: 'ogriffin@vagrant-ubuntu-lucid',
		default_pass: 'ogriffin',
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
				    domain = jid.match(/@(.*)/)[1];
				    password = $('#pass', event.target).get(0).value;
				    connection.account.authenticate(jid, domain, password);
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



    (function() {
	$('#menu').dialog({
	    title: 'Menu',
	    position: ['left', 'top'],
	    autoOpen: false,
	    height: 300
	});
	$.each($('#menu button'), function(index, element) {
	    $(element).button();
	    if ($(element).hasClass('contacts')) {
	    }
	});
    }());
	



	connection = new Strophe.Connection(BOSH_SERVICE);

	$(".chat-bar").soashable_chatbar({connection: connection});
	$("#activities .publish-view").osw_activitypublish({connection: connection});
	$("#activities .activity-view").osw_activityview({connection: connection});
    $('#roster .body').osw_roster({connection: connection});

    connection.account.set_connection_callbacks(connection_callback);

	//connection.addHandler( received_message, 'message', null, null, null, null );

	// Uncomment the following lines to spy on the wire traffic.
	connection.rawInput = function (data) { console.debug('RECV: ' + data); };
	connection.rawOutput = function (data) { console.debug('SEND: ' + data); };

	// Uncomment the following line to see all the debug output.
	//Strophe.log = function (level, msg) { log('LOG: ' + msg); };



});



