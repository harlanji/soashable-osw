var Contact = {
	/**
	 * Function: has_element
	 *
	 * Returns true if an element exists which contains information about this contact.
	 **/
	has_element: function(contact) {
	    return ($('.' + contact.element_class).length > 0);
	},
	
    };

// Not used for now.
$.widget("ui.osw_roster", {
    options: {
	connection: null
    },
    _create: function() {
	$.osw_controller(this);
    },
    _init: function() {
	var that = this;
	this.options.connection.roster.set_callbacks({
	    presence_subscription_request: function() {
	    },
	    presence_changed: function(contact) {
		var element, group_list, contactlist_element, group_element, create_subscription_element, create_group_list_element, group_prompt_handler, create_group_element;
		if (Contact.has_element(contact)) {
		    Contact.update_status(contact);
		} else {
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

		    create_group_element = function(contact, name) {
			var group_element = $(document.createElement('li'));
			group_element.text(name);
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

		    create_group_list_element = function(group_list, contact) {
			$.each(contact.groups, function(index, value) {
			    group_list.append(create_group_element(contact, value));
			});
		    };

		    group_prompt_handler = function(event) {
			var group_name = prompt('Enter a name of the group');
			add_group(group_name, event.data.contact.jid);
		    };

		    contactlist_element = $(that.element);

		    if (!Contact.has_element(contact)) {
			element = $(document.createElement('li'));
			element.addClass(contact.element_class);
			element.addClass('contact');
			element.append('<img src="" class="avatar"/><span class="nickname">' + contact.jid + '</span>');
			// Create a button indicating if this contact is followed or not
			element.append(create_subscription_element(contact));
			
			// Create a list for containing the groups belonging to the contact
			group_list = $(document.createElement('ul'));
			group_list.addClass('groups');
			// Populate group list for the element
			create_group_list_element(group_list, contact);
			
			// Add an 'add' to the group list which will add another group to the contact
			group_element = $(document.createElement('li'));
			group_element.text('[add]');
			group_element.addClass('action');
			group_element.data('jid', contact.jid);
			group_element.bind('click', {
			    contact: contact
			}, group_prompt_handler);
			group_list.append(group_element);
			// Add the group list to the contact
			element.append(group_list);
			contactlist_element.append(element);
		    }
		}
	    }
	});
    },						   
    destroy: function() {
	
    },
    refresh: function() {
	this.options.connection.roster.fetch();
    }
});
