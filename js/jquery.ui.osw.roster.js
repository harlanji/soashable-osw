var Contact = {
    /**
     * Function: has_element
     *
     * Returns true if an element exists which contains information about this contact.
     **/
    has_element: function(contact) {
	return ($('.' + Contact.get_matcher_from_jid(contact.jid)).length > 0);
    },
    
    get_matcher: function(contact) {
	return Strophe.getNodeFromJid(contact.jid) + '_' +  Strophe.getDomainFromJid(contact.jid).replace(/[\-\/\.]/g,'');
    },

    get_matcher_from_jid: function(jid) {
	return Strophe.getNodeFromJid(jid) + '_' +  Strophe.getDomainFromJid(jid).replace(/[\-\/\.]/g,'');
    }
	
};

var defined = function(obj) {
    return typeof(obj) !== 'undefined';
};

// Not used for now.
$.widget("ui.osw_roster", {
    options: {
	connection: null
    },
    _create: function() {
	$.osw_controller(this);
    },
    _update_contact: function(contact) {
	var that, element, group_list, contactlist_element, group_element, create_subscription_element, create_group_list_element, group_prompt_handler, create_group_element, create_vcard_button;

	that = this;

	create_subscription_element = function(contact) {
	    var subscription_element;
	    subscription_element = $(document.createElement('span'));
	    subscription_element.addClass('subscription action');
	    subscription_element.text('[follow]');
	    subscription_element.bind('click', function() {
		var status = $(this).html();
		if (status === '[follow]') {
				connection.roster.follow(contact.jid, function() {
			contact.subscription = 'unsubscribe';
			subscription_element.text('[unfollow]');
		    });
		} else if (status === '[unfollow]') {
				connection.roster.unfollow(contact.jid, function() {
			contact.subscription = 'subscribe';
			subscription_element.text('[follow]');
		    });
		}
	    });
	    element.append(subscription_element);
	    return subscription_element;
	};

	create_vcard_button = function(contact) {
	    var button;
	    button = $(document.createElement('span'));
	    button.addClass('vcard action');
	    button.text('[vcard]');
	    button.bind('click', function() {
		// TODO: This should probably be moved out into a seperate jQuery widget
		connection.vcardtemp.fetch(contact.jid, function(vcard) {
		    // Populate the hCard
		    (function() {
			var properties, set_hcard_element, index;
			console.debug('Populating hcard');
			console.debug(vcard);
			// Function which will set the value of a hCard element. If the
			// value is not defined or is blank then the hCard element will be
			// hidden.
			set_hcard_element = function(expression, value) {
			    element = $(expression);
			    if (element.length > 0) {
				element = element.first();
				if (typeof(value) === 'undefined' || value === '') {
				    element.hide();
				} else {
				    element.show();
				    element.children('.value').first().text(value);
				}
			    }
			};
			// A list of jQuery matchers and a matching VCARD property
			properties = [{
			    expression: '.vcard .fn.surname',
			    value: (defined(vcard.N) && defined(vcard.N.SURNAME) ? vcard.N.SURNAME : '')
			}, {
			    expression: '.vcard .fn.given',
			    value: (defined(vcard.N) && defined(vcard.N.GIVEN) ? vcard.N.GIVEN : '')
			}, {
			    expression: '.vcard .nickname',
			    value: (defined(vcard.NICKNAME) ? vcard.NICKNAME : '')
			}];
			// Iterate through the properties and set the hCard element within the dialog
			for (index = 0; index < properties.length; index ++) {
			    set_hcard_element(properties[index].expression, properties[index].value);
			}
			// Do something special for the avatar property
			if (defined(vcard.PHOTO) && defined(vcard.PHOTO.BINVAL)) {
			    // TODO: Insert some IE specific code here
			    $('.vcard .avatar').first().attr('src', 'data:' + vcard.PHOTO.TYPE + ';base64,' + vcard.PHOTO.BINVAL).show();
			} else {
			    $('.vcard .avatar').hide();
			}
		    }());
		    $('#vcard_dialog').dialog({
			autoOpen: true, 
			height: 300,
			width: 300,
			title: 'VCard for ' + contact.name
		    });
		});
	    });
	    return button;
	};
	
	group_prompt_handler = function(event) {
	    var group_name = prompt('Enter a name of the group');
	    add_group(group_name, event.data.contact.jid);
	};
	
	create_group_list_element = function(contact) {
	    var group_list, group_element, create_group_element;
	    
	    create_group_element = function(contact, name) {
		var group_element = $(document.createElement('li'));
		group_element.text(name);
		group_element.addClass('group');
		// Create a remove button to this group
		group_element.append((function() {
		    var remove_element = $(document.createElement('span'));
		    remove_element.text('[remove]');
		    remove_element.data('jid', contact.jid);
		    remove_element.addClass('action');
		    remove_element.bind('click', {
			contact: contact,
			group: name
		    }, function(event) { 
			alert('This will remove ' + event.data.group +' from ' + event.data.contact.jid); 
		    });
		    return remove_element;
		}()));
		return group_element;
	    };
	    
	    // Create a list for containing the groups belonging to the contact
	    group_list = $(document.createElement('ul'));
	    group_list.addClass('groups');
	    
	    if (typeof(contact.groups) !== 'undefined') {
		$.each(contact.groups, function(index, value) {
		    group_list.append(create_group_element(contact, value));
		});
	    }
	    // Add an 'add' to the group list which will add another group to the contact
	    group_element = $(document.createElement('li'));
	    group_element.text('[add]');
	    group_element.addClass('action');
	    group_element.data('jid', contact.jid);
	    group_element.bind('click', {
		contact: contact
	    }, group_prompt_handler);
	    group_list.append(group_element);
	    return group_list;
	};
	
	if (Contact.has_element(contact)) {
	    // Update the name of all contacts
	    $.each($('.' + Contact.get_matcher(contact) + ' .name'), function(index, element) {
		$(element).html(contact.name === '' ? contact.jid : contact.name);
	    });
	    if (typeof(contact.avatar) !== 'undefined' && contact.avatar !== '') {
		if (typeof(contact.avatar.url) === 'undefined' || contact.avatar.url === '') {
		    $.each($('.' + Contact.get_matcher(contact) + ' img.avatar'), function(index, element) {
			element.src = 'data:' + contact.avatar.type + ';base64,' + contact.avatar.data;
		    });
		} else {

		}
	    }
	} else {
	    contactlist_element = $(that.element);
	    element = $(document.createElement('li'));
	    element.addClass(Contact.get_matcher(contact));
	    element.addClass('contact');
	    avatar = document.createElement('img');
	    $(avatar).addClass('avatar');
	    element.append(avatar);
	    element.append('<span class="name">' + contact.name + '</span>');
	    // Create a button indicating if this contact is followed or not
	    element.append(create_subscription_element(contact));
	    element.append(create_vcard_button(contact));
	    contactlist_element.append(element);	
	}

	// Update the current status of the contact
	$.each($('.' + Contact.get_matcher(contact)), function(index, value) {
	    var element = $(value);
	    element.removeClass(function(index, className) {
		return className.substring(0,3)==='st_';
	    });
	    if (typeof(contact.status) !== 'undefined') {
		element.addClass('st_' + contact.status);
	    }
	    if (contact.available) {
		element.addClass('available');
	    }
	});

	// Remove any existing group lists
	$('.' + Contact.get_matcher(contact) + ' .groups').remove();

	$.each($('.' + Contact.get_matcher(contact)), function(index, value) {
	    var element = $(value);
	    // Populate group list for the element
	    element.append(create_group_list_element(contact));
	    // Add the group list to the contact
	    element.append(group_list);
	});

	// Remove any existing resource list
	$('.' + Contact.get_matcher(contact) + ' .resources').remove();	
    },
    _init: function() {
	var that = this;
if (typeof(this.options.connection.roster.set_callbacks) !== 'undefined') {
	this.options.connection.roster.set_callbacks({
	    presence_subscription_request: function() {
	    },
	    contact_changed: function(contact) {
		that._update_contact(contact);
	    }
	});
}
    },						   
    destroy: function() {
	
    },
    refresh: function() {
	if (typeof(this.options.connection.roster) !== 'undefined') {
	this.options.connection.roster.fetch();
	}
    }
});
