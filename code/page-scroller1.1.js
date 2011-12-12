/* 
	jQuery Page Scroller plugin - v1.0	 
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// OPTIONS: 
// nav				: 'string'	- the selector of the navigation list
// addEvents		: 'boolean' - allows/disables events in the children of the nav items
// activeClass		: 'string'	- the class on the active list item
// hasAnchor		: 'boolean'	- sets whether an anchor on the page is associated with the nav item.
// speed			: 'integer' - sets the animation speed 
// startPosition	: 'integer' - the item that the plugin starts on  

// version 1.0 - basic functionality
// version 1.1 - changed the animation of the position of the parent, to animate to a scroll position

(function($){

	$.fn.pageScroller = function(config)
	{
		// config - default settings
		var settings = {
							'nav' : '.scrollerNav ul',	// class of the scroller nav
							'addEvents' : false,		// allows events in the nav items children
							'activeClass' : 'active',	// nav active class
							'hasAnchor' : true,			// if no anchor associated with each item then set to false
							'speed' : 500,				// speed the animation goes
							'easing' : 'easeInOutBack',	// easing effect on the animation
							'startPosition' : 0			// set the start position of the scroller
					 };
 
		// if settings have been defined then overwrite the default ones
		// comments:	true value makes the merge recursive. that is - 'deep' copy
		//				{} creates an empty object so that the second object doesn't overwrite the first object
		//				this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//				the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){

			var scroller = $(this);
			scroller.nav = $(opts.nav);
			scroller.length = scroller.nav.children().length;
			scroller.counter = opts.startPosition;
			if (!$.ui)
			{
				opts.easing = "linear";
			}			
						
			// initialise the scroller
			$.fn.pageScroller.init(scroller, opts);
			
			// add the navigation events
			$.fn.pageScroller.addNav(scroller, opts);
			
			// add event handling to detect where in the scroller the user is on window scroll
			$(window).scroll(function(){
				//console.log($(window).scrollTop());
				// the first thing I need to detect is when the user gets to the bottom of the page. then I can just add active to the last item in the scroll nav
				var scrollY = $(window).scrollTop(),
					winY = $(window).height(),
					docY = $(document).height(),
					elementPositions = [],
					elementsLength,
					i,
					currentItem = 0;
					
					if ((scrollY + winY) >= docY)
					{
						// then we are definately on the last item
						// do code for last item here
						//console.log("i hit the end of the document");
						scroller.nav.children(":not(:last)").removeClass("active");
						scroller.nav.children(":last").addClass("active");
					}
					else
					{
						// set up function to detect where abouts on the page we are
						// get the scroll positions of each anchor, then find out which is closest
						scroller.nav.children().each(function(){
							var selector,
								itemPosition;
							if ($(this).attr("href"))
							{
								selector = $(this).attr("href");
							}
							else
							{
								selector = $(this).find("a").attr("href");
							}
							itemPosition = Math.floor($(selector).offset().top);
							//console.log("pos: "+itemPosition+", scrollY: "+scrollY);
							elementPositions.push(itemPosition);
							
							
						});
						
						//console.log(elementPositions);
						// loop through the element positions and find the closest one to the window scrollposition
						elementsLength = elementPositions.length;
						for (i = 0; i < elementsLength; i += 1)
						{
							
							//console.log((scrollY - elementPositions[i]));
							if ((scrollY - elementPositions[i]) > 0)
							{
								currentItem = i;
							}
						}
						//console.log("currentItem: "+currentItem);
						scroller.nav.children(":not(:eq("+currentItem+"))").removeClass("active");
						scroller.nav.children(":eq("+currentItem+")").addClass("active");
						// watch out for the top one. if none have been passed then show the first item. If no item was selected then show the first
					}
			});
			
			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here
	$.fn.pageScroller.init = function(scroller, opts)
	{
		// add the active class to the starting item
		scroller.nav.children(":eq(" + opts.startPosition + ")").addClass(opts.activeClass);
		
	};
	
	$.fn.pageScroller.addNav = function(scroller, opts)
	{
		// add click events for each of the nav items
		scroller.nav.children().each(function()
		{

			$(this).click(function(){
				// set the scroller counter
				scroller.counter = $(this).parent().children().index(this);
				$.fn.pageScroller.moveScoller(scroller, opts);
				return false;
			});
			
			// make sure everything below won't trigger an event if not desired
			if (opts.addEevnts === false)
			{
				$(this).children().click(function(){
					alert("returning false");
					return false;
				});
			}
			
		});
		
		// add keyboard events for the scroller
		document.onkeydown = function(e)
		{
			var keycode;
			if (window.event)
			{
				keycode = window.event.keyCode;
			}
			else if (e)
			{
				keycode = e.which;
			}
			// you can use the right and down arrows to move forward
			if (keycode == 39 || keycode == 40)
			{
				// show the next box
				scroller.counter += 1;
				if (scroller.counter == scroller.length)
				{
					scroller.counter = 0;
				}
				$.fn.pageScroller.moveScoller(scroller, opts);
			}
			// you can use the left and up arrows to move backward
			else if (keycode == 37 || keycode == 38)
			{
				// show the previous box
				scroller.counter -= 1;
				if (scroller.counter < 0)
				{
					scroller.counter = scroller.length - 1;
				}
				$.fn.pageScroller.moveScoller(scroller, opts);
			}
			
		};
	};

	$.fn.pageScroller.moveScoller = function(scroller, opts)
	{
		var currentNavItem = scroller.nav.children(":eq(" + scroller.counter + ")"),
			currentHref,
			currentItem,
			itemOffset;
		
		// find my href value
		if (currentNavItem.attr("href"))
		{
			currentHref = currentNavItem.attr("href");
		}
		else
		{
			currentHref = currentNavItem.find("a").attr("href");
		}
		//console.log(currentHref);
		currentItem = $(currentHref);
		
		// find the offset of the div
		itemOffset = Math.ceil(currentItem.offset().top);
		
		//console.log("item: " + itemOffset + ", parent: " + parentOffset + ", total: " + totalOffset);
		$("html,body").stop().animate({scrollTop:itemOffset}, opts.speed, opts.easing);
	};

	// end of module
})(jQuery);