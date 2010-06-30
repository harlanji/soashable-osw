
$.widget("ui.osw_profile", {
    options: {
	connection: null
    },
    _create: function() {
	$.osw_controller(this);
	// If the element is a form, ensure it is not submitted.
	if (this.element.is('form')) {
	    this.element.submit(function() { return false; });
	}
	$('.save', this.element).button();
    },
    _init: function() {
	
    },						   
    destroy: function() {
	
    },
    ':click:.save': function() {
	var parse_htmlform = function(element, builder) {
	    $.each($(element).children(), function(index, child) {
		child = $(child);
		if (child.is('fieldset') || child.is('label')) {
		    builder.c(child.attr('class'));
		    parse_htmlform(child, builder);
		    builder.up();
		} else if (child.is('input')) {
		    builder.c(child.attr('class'));
		    builder.t(child.val());
		    builder.up();
		}
	    });
	};
	this.options.connection.vcard.save(function(builder) {
	    parse_htmlform($('#profile form'), builder);
	    return builder;
	});
    },
    'refresh': function() {
	console.info("Refreshing profile");
	this.options.connection.vcard.fetch(this.options.connection.jid, function(contact) {
	    $.each($(contact.vcard).children(), function(index, element) {
		console.debug(element.nodeName);
	    });
	});
    }
});
