
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
    'refresh': function(event, ui) {
	var fetch_callback = function(vcard) {
	    var properties, set_form_element, index;
	    // Function which will set the value of the profile form.
	    set_form_element = function(expression, value) {
		element = $('#profile form ' + expression);
		if (element.length > 0) {
		    element = element.first();
		    if (value !== '') {
			element.children('.value').first().val(value);
		    }
		}
	    };
	    // A list of jQuery matchers and a matching VCARD property
	    properties = [{
		expression: '.n.surname',
		value: (defined(vcard.N) && defined(vcard.N.SURNAME) ? vcard.N.SURNAME : '')
	    }, {
		expression: '.n.given',
		value: (defined(vcard.N) && defined(vcard.N.GIVEN) ? vcard.N.GIVEN : '')
	    }, {
		expression: '.nickname',
		value: (defined(vcard.NICKNAME) ? vcard.NICKNAME : '')
	    }];
	    // Iterate through the properties and set the hCard element within the dialog
	    for (index = 0; index < properties.length; index ++) {
		set_form_element(properties[index].expression, properties[index].value);
	    }
	    // TODO: Somehow handle avatars
	};

	this.options.connection.vcardtemp.fetch(this.options.connection.jid, fetch_callback);
    },
    ':click:.save': function() {
	console.info("click:save");
	console.debug(this.options.connection.vcardtemp);
	this.options.connection.vcardtemp.save(function(builder) {
	    var parse_htmlform = function(element, builder, remove) {	
		$.each($(element).children(), function(index, child) {
		    child = $(child);
		    if (child.is('label') || child.is('fieldset')) {
			name = child.attr('class');
			$.each(remove.split(' '), function(index, r) {
			    name = name.replace(r.toLowerCase(), '');
			});
			name = name.replace(' ', '').toUpperCase();
			builder.c(name);
			parse_htmlform(child, builder, remove + ' ' + name);
			builder.up();
		    } else if (child.is('input')) {
			builder.t(child.val());
		    }
		});
	    };
	    parse_htmlform($('#profile form'), builder, '');
	    return builder;
	});
    }
});
