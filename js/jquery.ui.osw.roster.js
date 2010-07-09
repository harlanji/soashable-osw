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

// Not used for now.
$.widget("ui.osw_roster", {
    options: {
	connection: null
    },
    _create: function() {
	$.osw_controller(this);
    },
    _update_contact: function(contact) {
	var that, element, group_list, contactlist_element, group_element, create_subscription_element, create_group_list_element, group_prompt_handler, create_group_element;

	that = this;

	create_subscription_element = function(contact) {
	    var subscription_element;
	    subscription_element = $(document.createElement('span'));
	    subscription_element.addClass('subscription action');
	    subscription_element.text('[follow]');
	    subscription_element.bind('click', function() {
		var status = $(this).html();
		if (status === '[follow]') {
		    client.follow(contact.jid, function() {
			contact.subscription = 'unsubscribe';
			subscription_element.text('[unfollow]');
		    });
		} else if (status === '[unfollow]') {
		    client.unfollow(contact.jid, function() {
			contact.subscription = 'subscribe';
			subscription_element.text('[follow]');
		    });
		}
	    });
	    element.append(subscription_element);
	    return subscription_element;
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
	    
	    $.each($('.' + Contact.get_matcher(contact) + ' .nickname'), function(index, element) {
		$(element).html(contact.name);
	    });
	    if (typeof(contact.avatar) !== 'undefined' && contact.avatar !== '') {
		$.each($('.' + Contact.get_matcher(contact) + ' .avatar'), function(index, element) {
		    if (typeof(contact.avatar.url) === 'undefined' || contact.avatar.url === '') {
			$(element).attr('src', 'data:image/png;base64,' + contact.avatar.data);
		    } else {
			$(element).attr('src', contact.avatar.url);
		    }
		});
	    }
	} else {
	    contactlist_element = $(that.element);
	    element = $(document.createElement('li'));
	    element.addClass(Contact.get_matcher(contact));
	    element.addClass('contact');
	    element.append('<img src="/soashable-osw/images/avatar_18x24.png" class="avatar"/><span class="nickname">' + contact.name + '</span>');
	    // Create a button indicating if this contact is followed or not
	    element.append(create_subscription_element(contact));
	    contactlist_element.append(element);	
	}

	console.debug(contact);

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
	this.options.connection.roster.set_callbacks({
	    presence_subscription_request: function() {
	    },
	    contact_changed: function(contact) {
		that._update_contact(contact);
	    }
	});
    },						   
    destroy: function() {
	
    },
    refresh: function() {
	this.options.connection.roster.fetch();
    }
});
