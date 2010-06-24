/**
 * Derived from osw-js
 */
(function() {

Strophe.addConnectionPlugin('account', {
	_connection: null,

	init: function(connection) {
		this._connection = connection;

	},

	register: function(username,
			    domain, 
			    password, 
			    email_address, 
			    success_callback, 
			    error_callback) {

		// FIXME logger
		var logger = this._connection.logger;

		var iq;

		// Tell Strophe to initiate a connection. This only appears to have the purpose
		// of setting the domain. There must be a better way of doing this.
		this._connection.connect('', domain, '', callbacks.connection);

		logger.info('Attempting to register with: ' + username + ', ' + password + ', ' + email_address);
		iq = $iq({'type':'set'})
			.c('query', {'xmlns': OneSocialWeb.XMLNS.REGISTER})
			.c('username').t(username).up()
			.c('password').t(password).up()
			.c('email').t(email_address);
		logger.debug(iq.tree());

		this._connection.sendIQ(iq.tree(), function(stanza) {
			success_callback();
		}, function(stanza) {
			var error, message, code;
			error = $(stanza).find("error");
			message = error.children()[0].tagName;
			code = error.attr('code');
			error_callback(code, message);
		}); 


	}
});

})();
