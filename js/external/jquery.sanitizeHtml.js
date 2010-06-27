/*
* sanitizeHtml jQuery Plugin v1.0.0
*
* Copyright (c) 2010 Harlan Iverson
* Licensed under the MIT license.
*
*/

(function($) {


var defaultAllowTags = ['i', 'em', 'b', 'strong', 'u', 'font'];
// key = tag, value = attr
var defaultAllowAttrs = {
	'font': ['face', 'color', 'size'],
}

/*
Function: sanitizeChildren

	Companion function for the main plugin function. This recursively traverses
	the DOM starting at root and sanitizes each child. It includes text content
	in the proper position.

	Note that it does not sanitize the root node itself; it is assumed that
	the nodes to be sanitized are within a safe container.

Parameters:
	root - A DOM node or anything that will work in a jQuery selector. This
			node is not sanitized; only its children.
	allowTags - An array of tags to allow. Default is: i, em, b, strong, u, font.
	allowAttrs - A map of tag => [attr] to allow. Default is {'font' : ['face', 'color', size']}.
*/

function sanitizeChildren( root, allowTags, allowAttrs ) {
	allowTags = allowTags || defaultAllowTags;
	allowAttrs = allowAttrs || defaultAllowAttrs;

	$(root).children().each(function(i, child) {
		sanitizeChildren( child, allowTags, allowAttrs );

		var tag = child.localName.toLowerCase();

		if( $.inArray( tag, allowTags ) < 0 ) {
			$(child).contents().each(function(j, content) {
				$(content).remove().insertBefore(child);
			});
			$(child).remove();
		} else {
			$.each(child.attributes, function() {
				var attr = this.localName;

				if( !defaultAllowAttrs.hasOwnProperty(tag) 
					|| $.inArray( attr, defaultAllowAttrs[tag] ) < 0 ) {
					child.removeAttribute( attr );
				}
			});
		}
	});
};


/*
Function: jQuery.fn.sanitizeHtml

	Sanitizes the children of a given node. The root node is assumed to be
	a safe container so it is not sanitized itself; only the children. All 
	text is preserved (unlike with regex replacement) and kept in the proper
	place. For example, the HTML

	: <div><table><tr><td><p>Sup <b class='awesome'>dog</b><font color="red" class="awesomer">!</font> <em>I like dogs</em></p></td></tr></table> wasn't that table cool?</div>

	becomes:

	: <div>Sup <b>dog</b><font color="red">!</font> <em>I like dogs</em> wasn't that table cool?</div>

	Note: jQuery itself handles removal of some tags tags, such as <script>, 
	and I don't have the immediate need to allow them. If you know/find a solution 
	please let me know and I'll note it here.

Parameters:
	allowTags - An array of tags to allow. Default is: i, em, b, strong, u, font.
	allowAttrs - A map of tag => [attr] to allow. Default is {'font' : ['face', 'color', size']}.

Example:

	A typical use case is getting untrusted HTML back from a remote call and 
	wanting to append it to the page: 

	: $(".response").append( $(response).find(".content").clone().sanitizeHtml() );
*/


$.fn.sanitizeHtml = function(allowTags, allowAttrs) {
	allowTags = allowTags || defaultAllowTags;
	allowAttrs = allowAttrs || defaultAllowAttrs;

	sanitizeChildren( this, allowTags, allowAttrs );

	return $(this);
}

})(jQuery);
