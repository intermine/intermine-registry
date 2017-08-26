/**
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * Enchanced by @lkuffo to fullify InterMine Registry project requirements:
 * This file is in charge all the Grid view functionality and content.
 */

var instance_clicked = "";
jQuery_1_9_1(".main a").click(function(){
		instance_clicked = $(this).attr('data-description');
});

(function($){

var $event = $.event,
$special,
resizeTimeout;

$special = $event.special.debouncedresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments,
			dispatch = function() {
				// set correct event type
				event.type = "debouncedresize";
				$event.dispatch.apply( context, args );
			};

		if ( resizeTimeout ) {
			clearTimeout( resizeTimeout );
		}

		execAsap ?
			dispatch() :
			resizeTimeout = setTimeout( dispatch, $special.threshold );
	},
	threshold: 250
};

// ======================= imagesLoaded Plugin ===============================
// https://github.com/desandro/imagesloaded

// $('#my-container').imagesLoaded(myFunction)
// execute a callback when all images have loaded.
// needed because .load() doesn't work on cached images

// callback function gets image collection as argument
//  this is the container

// original: MIT license. Paul Irish. 2010.
// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

// blank image data-uri bypasses webkit log warning (thx doug jones)
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

$.fn.imagesLoaded = function( callback ) {
	var $this = this,
		deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
		hasNotify = $.isFunction(deferred.notify),
		$images = $this.find('img').add( $this.filter('img') ),
		loaded = [],
		proper = [],
		broken = [];

	// Register deferred callbacks
	if ($.isPlainObject(callback)) {
		$.each(callback, function (key, value) {
			if (key === 'callback') {
				callback = value;
			} else if (deferred) {
				deferred[key](value);
			}
		});
	}

	function doneLoading() {
		var $proper = $(proper),
			$broken = $(broken);

		if ( deferred ) {
			if ( broken.length ) {
				deferred.reject( $images, $proper, $broken );
			} else {
				deferred.resolve( $images );
			}
		}

		if ( $.isFunction( callback ) ) {
			callback.call( $this, $images, $proper, $broken );
		}
	}

	function imgLoaded( img, isBroken ) {
		// don't proceed if BLANK image, or image is already loaded
		if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
			return;
		}

		// store element in loaded images array
		loaded.push( img );

		// keep track of broken and properly loaded images
		if ( isBroken ) {
			broken.push( img );
		} else {
			proper.push( img );
		}

		// cache image and its state for future calls
		$.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

		// trigger deferred progress method if present
		if ( hasNotify ) {
			deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
		}

		// call doneLoading and clean listeners if all images are loaded
		if ( $images.length === loaded.length ){
			setTimeout( doneLoading );
			$images.unbind( '.imagesLoaded' );
		}
	}

	// if no images, trigger immediately
	if ( !$images.length ) {
		doneLoading();
	} else {
		$images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
			// trigger imgLoaded
			imgLoaded( event.target, event.type === 'error' );
		}).each( function( i, el ) {
			var src = el.src;

			// find out if this image has been already checked for status
			// if it was, and src has not changed, call imgLoaded on it
			var cached = $.data( el, 'imagesLoaded' );
			if ( cached && cached.src === src ) {
				imgLoaded( el, cached.isBroken );
				return;
			}

			// if complete is true and browser supports natural sizes, try
			// to check for image status manually
			if ( el.complete && el.naturalWidth !== undefined ) {
				imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
				return;
			}

			// cached images don't fire load sometimes, so we reset src, but only when
			// dealing with IE, or image is complete (loaded) and failed manual check
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			if ( el.readyState || el.complete ) {
				el.src = BLANK;
				el.src = src;
			}
		});
	}

	return deferred ? deferred.promise( $this ) : $this;
};
})(jQuery_1_9_1);

var Grid = (function($) {

		// list of items
	var $grid = $( '#og-grid' ),
		// the items
		$items = $grid.children( 'li' ),
		// current expanded item's index
		current = -1,
		// position (top) of the expanded item
		// used to know if the preview will expand in a different row
		previewPos = -1,
		// extra amount of pixels to scroll the window
		scrollExtra = 0,
		// extra margin when expanded (between preview overlay and the next items)
		marginExpanded = 10,
		$window = $( window ), winsize,
		$body = $( 'html, body' ),
		// transitionend events
		transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',
			'MozTransition' : 'transitionend',
			'OTransition' : 'oTransitionEnd',
			'msTransition' : 'MSTransitionEnd',
			'transition' : 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		// support for csstransitions
		support = Modernizr.csstransitions,
		// default settings
		settings = {
			minHeight : 420,
			speed : 500,
			easing : 'ease'
		};

	function init( config ) {

		// the settings..
		settings = $.extend( true, {}, settings, config );

		// preload all images
		$grid.imagesLoaded( function() {

			// save item´s size and offset
			saveItemInfo( true );
			// get window´s size
			getWinSize();
			// initialize some events
			initEvents();

		} );

	}

	// add more items to the grid.
	// the new items need to appended to the grid.
	// after that call Grid.addItems(theItems);
	function addItems( $newitems ) {

		$items = $items.add( $newitems );

		$newitems.each( function() {
			var $item = $( this );
			$item.data( {
				offsetTop : $item.offset().top,
				height : $item.height()
			} );
		} );

		initItemsEvents( $newitems );

	}

	// saves the item´s offset top and height (if saveheight is true)
	function saveItemInfo( saveheight ) {
		$items.each( function() {
			var $item = $( this );
			$item.data( 'offsetTop', $item.offset().top );
			if( saveheight ) {
				$item.data( 'height', $item.height() );
			}
		} );
	}

	function initEvents() {

		// when clicking an item, show the preview with the item´s info and large image.
		// close the item if already expanded.
		// also close if clicking on the item´s cross
		initItemsEvents( $items );

		// on window resize get the window´s size again
		// reset some values..
		$window.on( 'debouncedresize', function() {

			scrollExtra = 0;
			previewPos = -1;
			// save item´s offset
			saveItemInfo();
			getWinSize();
			var preview = $.data( this, 'preview' );
			if( typeof preview != 'undefined' ) {
				hidePreview();
			}

		} );

	}

	function initItemsEvents( $items ) {
		$items.on( 'click', 'span.og-close', function() {
			hidePreview();
			return false;
		} ).children( 'a' ).on( 'click', function(e) {

			var $item = $( this ).parent();
			// check if item already opened
			current === $item.index() ? hidePreview() : showPreview( $item );
			return false;

		} );
	}

	function getWinSize() {
		winsize = { width : $window.width(), height : $window.height() };
	}

	function showPreview( $item ) {

		var preview = $.data( this, 'preview' ),
			// item´s offset top
			position = $item.data( 'offsetTop' );

		scrollExtra = 0;

		// if a preview exists and previewPos is different (different row) from item´s top then close it
		if( typeof preview != 'undefined' ) {

			// not in the same row
			if( previewPos !== position ) {
				// if position > previewPos then we need to take te current preview´s height in consideration when scrolling the window
				if( position > previewPos ) {
					scrollExtra = preview.height;
				}
				hidePreview();
			}
			// same row
			else {
				preview.update( $item );
				return false;
			}

		}

		// update previewPos
		previewPos = position;
		// initialize new preview for the clicked item
		preview = $.data( this, 'preview', new Preview( $item ) );
		// expand preview overlay
		preview.open();

	}

	function hidePreview() {
		current = -1;
		var preview = $.data( this, 'preview' );
		preview.close();
		$.removeData( this, 'preview' );
	}

	// the preview obj / overlay
	function Preview( $item ) {
		this.$item = $item;
		this.expandedIdx = this.$item.index();
		this.create();
		this.update();
	}

	Preview.prototype = {
		create : function() {
			// create Preview structure:
			var value = "CAMBIADO";
			var myPanorama = this;

			// Preview Structure adapted to Intermine Registry
			myPanorama.$description = $( '<p id="data-description"></p><br>' );
			myPanorama.$title = $( '<h2 id="grid-instance-title"></h2>' );
			myPanorama.$information = $( '<div id="grid-instance-details" class="pb-20"></div>' );
			myPanorama.$href = $( '<div id="grid-preview-buttons-div" class="align-right mr-30 mb-10" style="position:absolute; bottom:0; right:0;">' +
															'<a id="grid-instance-url" class="btn btn-default btn-raised" href="#" target="_blank">Visit website</a>' +
															'<a id="grid-update" href="#" style="display: none;" class="btn btn-raised btn-info ml-10"> Update </a>' +
															'<button class="btn btn-raised sync syncmineb ml-10" style="display: none;" id="grid-sync"> Synchronize </button>' +
															'<button class="btn btn-raised btn-danger ml-10 deletemineg" style="display: none;" id="grid-delete"> Delete </button></div>'
														);
			myPanorama.$details = $( '<div class="row"> <div id="grid-right-preview"> </div> </div>' ).append( myPanorama.$title, myPanorama.$description, myPanorama.$information, myPanorama.$href );
			myPanorama.$loading = $( '<div class="og-loading"></div>' );
			//myPanorama.$fullimage = $( '<div class="og-fullimg mt-20"> </div>' );
			myPanorama.$closePreview = $( '<span class="og-close"></span>' );
			myPanorama.$previewInner = $( '<div class="og-expander-inner ml-20 mr-50"></div>' ).append( myPanorama.$closePreview, myPanorama.$fullimage, myPanorama.$details );
			myPanorama.$previewEl = $( '<div class="og-expander"></div>' ).append( myPanorama.$previewInner );
			// append preview element to the item
			myPanorama.$item.append( myPanorama.getEl() );
			// set the transitions for the preview and the item
			if( support ) {
				myPanorama.setTransition();
			}

			// Get the expanded grid instance information, and buttons functionalities
			$.ajax({
				url: "service/instances/" + instance_clicked,
				success: function(response){
					var instance = response.instance;
					var name = instance.name;

					// Update Button
					$("#grid-update").attr('href', 'instance/?update=' + instance.id);

					// Sync Button
					$("#grid-sync").click(function(){
						$.ajax({
	            url: 'service/synchronize/' + instance.id,
	            type: 'PUT',
	            success: function(result){
								localStorage.setItem("message", "Instance " + instance.name + " was updated successfully.");
	              window.location = window.location.pathname;
	            },
							beforeSend: function(xhr){
								xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
							}
	          });
					});
					// If user is undefined, none of this buttons appear.
					if (typeof user !== "undefined"){
						$("#grid-sync").css("display","inline");
						$("#grid-update").css("display","inline");
						$("#grid-delete").css("display","inline");
					}


					$(".deletemineg").click(function(){
						var r = confirm("Are you sure deleting " + instance.name + " from the Intermine Registry?");
						if (r === true){
							if (typeof user !== "undefined"){
		            $.ajax({
		              url: 'service/instances/' + instance.id,
		              type: 'DELETE',
		              success: function(result){
		                localStorage.setItem("message", "Instance " + instance.name + " was deleted successfully.");
		                window.location = window.location.pathname;
		              },
		              beforeSend: function(xhr){
		                xhr.setRequestHeader("Authorization", "Basic " + btoa(user.user + ":" + user.password));
		              }
		            });
		          }
						}
	        });



					// Fill Preview Box Content

					// Image
		      if (typeof instance.images !== "undefined" && typeof instance.images.logo !== "undefined"){
						if (instance.images.logo.startsWith("http")){
		          imageURL = instance.images.logo;
		        } else {
		          imageURL = instance.url + "/" + instance.images.logo;
		        }
		      } else {
		        imageURL = "http://intermine.readthedocs.org/en/latest/_static/img/logo.png"
		      }
					$("#grid-instance-title").append("<img class='ml-20' src='" + imageURL + "' alt='Icon'>");
					// Versions
					$("#grid-instance-details").append('<div class="mt-5 align-left" id="grid-details-versions"><span class="bold"> API Version: </span><span id="grid-api-version">'+instance.api_version+'</span></div>')
					if (instance.release_version !== ""){
	          $("#grid-details-versions").append(
	            '<br><br><span class="bold"> Release Version: </span>' +
	            '<span id="grid-release-version"> '+ instance.release_version + '</span>'
	          );
	        }
	        if (instance.intermine_version !== ""){
	          $("#grid-details-versions").append(
	            '<br><br><span class="bold"> Intermine Version: </span>' +
	            '<span id="grid-intermine-version"> '+ instance.intermine_version + '</span>'
	          );
	        }
					// Organisms
					for (var z = 0; z < instance.organisms.length; z++){
						instance.organisms[z] = instance.organisms[z].trim();
					}
					instance.organisms = instance.organisms.sort();
					if (instance.organisms.length != 0){
	          var list = "";
	          for (var j = 0; j < instance.organisms.length; j++){
								if (j == instance.organisms.length - 1){
										list += instance.organisms[j] + "";
								} else {
									  list += instance.organisms[j] + ", ";
								}

	          }
	          $("#grid-instance-details").append(
	            '<br>'+
	            '<div class="align-left">' +
	            '<span class="bold"> Organisms: </span>' +
	            list +
	            '</div>'
	          );
	        }
					// Neighbours
					if (instance.neighbours.length != 0){
	          var list = "";
	          for (var j = 0; j < instance.neighbours.length; j++){
								if (j == instance.neighbours.length - 1){
										list += instance.neighbours[j] + "";
								} else {
									  list += instance.neighbours[j] + ", ";
								}

	          }
	          $("#grid-instance-details").append(
	            '<br>'+
	            '<div class="align-left">' +
	            '<span class="bold"> Neighbours: </span>' +
	              list +
	            '</div>'
	          );
	        }
					// Twitter
					if (instance.twitter !== ""){
	          $("#grid-instance-details").append(
	            '<div class="align-left mb-30 ml-30" style="position:absolute; bottom:0; left:0;">' +
            	'<i class="fa fa-twitter" aria-hidden="true" style="font-size: 30px;"></i>' +
	            '<a id="list-release-version" target="_blank" href="https://twitter.com/'+instance.twitter+'"> '+ instance.twitter + '</a>' +
	            '</div>'
	          );
	        }
					// Title
					$("#grid-instance-title").text(name);
					// Description
					$("#data-description").text(instance.description);
					// Url
					$("#grid-instance-url").attr("href", instance.url);
				}
			});
		},
		update : function( $item ) {

			if( $item ) {
				this.$item = $item;
			}

			// if already expanded remove class "og-expanded" from current item and add it to new item
			if( current !== -1 ) {
				var $currentItem = $items.eq( current );
				$currentItem.removeClass( 'og-expanded' );
				this.$item.addClass( 'og-expanded' );
				// position the preview correctly
				this.positionPreview();
			}

			// update current value
			current = this.$item.index();

			// update preview´s content
			var $itemEl = this.$item.children( 'a' ),
				eldata = {
					href : $itemEl.attr( 'href' ),
					largesrc : $itemEl.data( 'largesrc' ),
					title : $itemEl.data( 'title' ),
					description : $itemEl.data( 'description' )
				};
			var myPanorama = this;

			// Same logic as when expanding

			$.ajax({
				url: "service/instances/" + instance_clicked,
				success: function(response){
					var instance = response.instance;
					var name = instance.name;

					$("#grid-update").attr('href', 'instance/?update=' + instance.id);

					$(".og-fullimg").empty();
					$("#grid-instance-details").empty();
					$("#grid-right-preview").empty();

					myPanorama.$title.html( instance.name );
					myPanorama.$description.html( instance.description);
					myPanorama.$href.attr( 'href', instance.url );
					$("#grid-instance-url").attr('href', instance.url);
					var self = myPanorama;

					if (typeof instance.images !== "undefined" && typeof instance.images.logo !== "undefined"){
		        if (instance.images.logo.startsWith("http")){
		          imageURL = instance.images.logo;
		        } else {
		          imageURL = instance.url + "/" + instance.images.logo;
		        }
		      } else {
		        imageURL = "http://intermine.readthedocs.org/en/latest/_static/img/logo.png"
		      }
					$("#grid-instance-title").append("<img class='ml-20' src='" + imageURL + "' alt='Icon'>")
					$("#grid-instance-details").append('<div class="align-left" id="grid-details-versions"><span class="bold"> API Version: </span><span id="grid-api-version">'+instance.api_version+'</span></div>')

					if (instance.release_version !== ""){
	          $("#grid-details-versions").append(
	            '<br><br><span class="bold"> Release Version: </span>' +
	            '<span id="grid-release-version"> '+ instance.release_version + '</span>'
	          );
	        }

	        if (instance.intermine_version !== ""){
	          $("#grid-details-versions").append(
	            '<br><br><span class="bold"> Intermine Version: </span>' +
	            '<span id="grid-intermine-version"> '+ instance.intermine_version + '</span>'
	          );
	        }
					for (var z = 0; z < instance.organisms.length; z++){
						instance.organisms[z] = instance.organisms[z].trim();
					}
					instance.organisms = instance.organisms.sort();
					if (instance.organisms.length != 0){
	          var list = "";
	          for (var j = 0; j < instance.organisms.length; j++){
								if (j == instance.organisms.length - 1){
										list += instance.organisms[j] + "";
								} else {
									  list += instance.organisms[j] + ", ";
								}

	          }
	          $("#grid-instance-details").append(
	            '<br>'+
	            '<div class="align-left">' +
	            '<span class="bold"> Organisms: </span>' +
	              list +
	            '</div>'
	          );
	        }

					if (instance.neighbours.length != 0){
	          var list = "";
	          for (var j = 0; j < instance.neighbours.length; j++){
								if (j == instance.neighbours.length - 1){
										list += instance.neighbours[j] + "";
								} else {
									  list += instance.neighbours[j] + ", ";
								}

	          }
	          $("#grid-instance-details").append(
	            '<br>'+
	            '<div class="align-left">' +
	            '<span class="bold"> Neighbours: </span>' +
	              list +
	            '</div>'
	          );
	        }

					if (instance.twitter !== ""){
	          $("#grid-instance-details").append(
	            '<div class="align-left mb-30 ml-30" style="position:absolute; bottom:0; left:0">' +
            	'<i class="fa fa-twitter" aria-hidden="true" style="font-size: 30px;"></i>' +
	            '<a id="list-release-version" target="_blank" href="https://twitter.com/'+instance.twitter+'"> '+ instance.twitter + '</a>' +
	            '</div>'
	          );
	        }


					// remove the current image in the preview
					if( typeof self.$largeImg != 'undefined' ) {
						self.$largeImg.remove();
					}

					// preload large image and add it to the preview
					// for smaller screens we don´t display the large image (the media query will hide the fullimage wrapper)
					// if( self.$fullimage.is( ':visible' ) ) {
					// 	myPanorama.$loading.show();
					// 	$( '<img/>' ).load( function() {
					// 		var $img = $( myPanorama );
					// 		if( $img.attr( 'src' ) === self.$item.children('a').data( 'largesrc' ) ) {
					// 			self.$loading.hide();
					// 			self.$fullimage.find( 'img' ).remove();
					// 			self.$largeImg = $img.fadeIn( 350 );
					// 			self.$fullimage.append( self.$largeImg );
					// 		}
					// 	} ).attr( 'src', eldata.largesrc );
					// }
				}
			});
			//this.$href.attr( 'href', eldata.href );
		},
		open : function() {

			setTimeout( $.proxy( function() {
				// set the height for the preview and the item
				this.setHeights();
				// scroll to position the preview in the right place
				this.positionPreview();
			}, this ), 25 );

		},
		close : function() {

			var self = this,
				onEndFn = function() {
					if( support ) {
						$( this ).off( transEndEventName );
					}
					self.$item.removeClass( 'og-expanded' );
					self.$previewEl.remove();
				};

			setTimeout( $.proxy( function() {

				if( typeof this.$largeImg !== 'undefined' ) {
					this.$largeImg.fadeOut( 'fast' );
				}
				this.$previewEl.css( 'height', 0 );
				// the current expanded item (might be different from this.$item)
				var $expandedItem = $items.eq( this.expandedIdx );
				$expandedItem.css( 'height', $expandedItem.data( 'height' ) ).on( transEndEventName, onEndFn );

				if( !support ) {
					onEndFn.call();
				}

			}, this ), 25 );

			return false;

		},
		calcHeight : function() {

			var heightPreview = winsize.height - this.$item.data( 'height' ) - marginExpanded,
				itemHeight = winsize.height;
			heightPreview = 200;
			if( heightPreview < settings.minHeight ) {
				heightPreview = settings.minHeight;
				itemHeight = settings.minHeight + this.$item.data( 'height' ) + marginExpanded;
			}

			this.height = heightPreview;
			this.itemHeight = itemHeight;

		},
		setHeights : function() {

			var self = this,
				onEndFn = function() {
					if( support ) {
						self.$item.off( transEndEventName );
					}
					self.$item.addClass( 'og-expanded' );
				};

			this.calcHeight();
			this.$previewEl.css( 'height', this.height );
			this.$item.css( 'height', this.itemHeight ).on( transEndEventName, onEndFn );

			if( !support ) {
				onEndFn.call();
			}

		},
		positionPreview : function() {

			// scroll page
			// case 1 : preview height + item height fits in window´s height
			// case 2 : preview height + item height does not fit in window´s height and preview height is smaller than window´s height
			// case 3 : preview height + item height does not fit in window´s height and preview height is bigger than window´s height
			var position = this.$item.data( 'offsetTop' ),
				previewOffsetT = this.$previewEl.offset().top - scrollExtra,
				scrollVal = this.height + this.$item.data( 'height' ) + marginExpanded <= winsize.height ? position : this.height < winsize.height ? previewOffsetT - ( winsize.height - this.height ) : previewOffsetT;

			$body.animate( { scrollTop : scrollVal }, settings.speed );

		},
		setTransition  : function() {
			this.$previewEl.css( 'transition', 'height ' + settings.speed + 'ms ' + settings.easing );
			this.$item.css( 'transition', 'height ' + settings.speed + 'ms ' + settings.easing );
		},
		getEl : function() {
			return this.$previewEl;
		}
	}

	return {
		init : init,
		addItems : addItems
	};

})(jQuery_1_9_1);
