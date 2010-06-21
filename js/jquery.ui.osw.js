(function($) {




$.widget( "ui.osw_roster", {
	options: {
		connection: null
	},

	_template: $.jqotec('<ul class="roster"></ul>'),
	_groupTemplate: $.jqotec('<li class="group" id="<%= this.id %>"><span class="name"><%= this.group_name %></span><ul class="entries"></ul></li>'),
	_entryTemplate: $.jqotec('<li class="entry" id="<%= this.id %>"><span class="alias"><%= this.alias %></span></li>'),
	
	_create: function() {

		this.options.connection.roster.registerCallback( this._received_roster );
	},
	_init: function() {
		$(this.element).jqotesub( this._template, {} );
	},
	destroy: function() {
		
	},


	addgroup: function(group) {
		return $(this.element)
			.jqoteapp( this._groupTemplate, {
			id: this._groupElId(group),
			group_name: group
		} );
	},

	addentry: function(group, jid) {
		return $( '#' + this._groupElId(group) + " > .entries" )
			.jqoteapp( this._entryTemplate, {
				id: this._entryElId(group, jid),
				alias: jid
			});
	},

	groupEl: function(group) {
		return $( '#' + this._groupElId(group) );
	},

	entryEl: function(group, jid) {
		return $( '#' + this._entryElId(group, jid) );
	},

	_received_roster: function(items) {
		alert("got roster");
	},

	_groupElId: function(group) {
		// TODO find a fast hashing function
		return MD5.hexdigest("group." + group);
	},
	_entryElId: function(group, jid) {
		// TODO find a fast hashing function
		return MD5.hexdigest("entry." + group + "." + jid);
	} 

});

$.widget("ui.osw_activitypublish", {
	options: {
		connection: null,
	},

	_template: $.jqotec('<div class="wtf"><form class="activity-publish"><input type="text" class="status" name="status"/><input type="submit" class="submit" name="submit" value="submit"/></form></div>'),

	_create: function() {
		var self = this;

		$(this.element).jqoteapp(this._template, {});

		$(this.element).find(".activity-publish").submit(function() {
			try {
				var status = $(this).find(".status").val();
				$(this).find(".status").val('');

				self.options.connection.osw.publishActivity( status );
			} finally {
				return false;
			}
		});
	},

	_clickedPublish: function() {

	}
});


$.widget( "ui.osw_activityview", {
	options: {
		connection: null,
	},

	_activityTemplate: $.jqotec('<div class="activity" id="<%= this.id %>"><p>Activity by <%= this.act.name %> (<%= this.act.jid %>): <%= this.act.title %>. contains <%= this.act.objects.length %> objects and <%= this.act.acl.length %> ACL rules.</p><div class="objects"></div></div>'),

	_objectTemplate: {
		'http://onesocialweb.org/spec/1.0/object/status': $.jqotec('<p>Status: <%= this.obj.status %></p>'),
		'http://onesocialweb.org/spec/1.0/object/picture': $.jqotec('<p>Picture: <%= this.obj.picture %></p>'),
		'' : $.jqotec('<p>Unknown object type: <%= this.obj.objectType %></p>'),
	},

	_create: function() {
		var self = this;

		this.element.append($("<div class='activities'></div>")); 

		this.options.connection.addHandler( function(msg) {
				
			try {		
				$().xmlns( self.options.connection.osw.JQUERY_NAMESPACES, function() {

					var entries = $("pubsubevt|event > pubsubevt|items > pubsubevt|item > atom|entry", msg);
					if( entries.length > 0 ) {
						entries.each(function(i, entry) {
							var activity = self.options.connection.osw._parseActivity( entry );

							self.append( activity );
						});
					}
				});
			} finally {
				return true;
			}

		}, null, "message", "headline", null, null, null);

	},
	_init: function() {

	},
	destroy: function() {

	},

	refresh: function() {
		$(".activities", this).html("");

		this.options.connection.osw.activities.get('harlan@osw1.soashable.com',
			$.proxy(this._osw_activity_callback, this));
	},


	append: function(act) {
		var actId = MD5.hexdigest( act.id );		

		// add the activity to the beginning of the stream
		$(this.element).find(".activities").jqotepre(this._activityTemplate, {
			id: actId,
			act: act
		});

		
		$.each(act.objects, $.proxy(function(i, obj) {
			var template = this._objectTemplate.hasOwnProperty( obj.objectType ) ?
				obj.objectType : '';

			// attach the object to the activity.
			$("#" + actId + " > .objects").jqoteapp( this._objectTemplate[ template ], {
				obj: obj
			});
		}, this));
	},

	_osw_activity_callback: function( act, options ) {
		this.append( act );
	}
});

})(jQuery);

