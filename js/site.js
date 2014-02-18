/*
 * Code by Ildar Sagdejev ( http://www.tknomad.com )
 */

function iconAnimate( icon ) {
  var i, h = icon.height(),
      x = icon.stop( true ).css('background-position').split(' '),
      lastStep = -1;

  //
  // Some browsers report background-position as
  // "<x> <y>", others as "left <x> top <y>"
  //
  x = ( x[0] === 'left' ) ? x[1] : x[0];

  $({ i: 0 }).animate(
    { i: 10.9 }, {
      duration: 500,
      step: function( step ) {
        /* round the step off for discrete frame jumps */
        step = ~~step;

        if( step != lastStep ) {
          lastStep = step;
          icon.css( 'background-position', x + ' ' + (h * step) + 'px' );
        }
      },
      complete: function() {
        icon.css( 'background-position', x + ' 0' );
      }
    }
  );
}

//
// Carousel showcase
//

var mirrorOpts = {
  gap: 3,
  height: 0.23
};

var showcase;

function showcaseInit() {
  showcase = $("#showcase");

  showcase.Cloud9Carousel( {
    yRadius: 48,
    speed: 3,
    mirror: mirrorOpts,
    buttonLeft: $("#nav-left"),
    buttonRight: $("#nav-right"),
    bringToFront: true,
    onRendered: showcaseUpdated,
    onLoaded: function() {
      // Completely remove 'loading...' animation
      var loading = $('#loading').fadeOut( 800, function() {
        loading.remove();
        showcase.unwrap();
      } );

      // The showcase is invisible until this point, fade it in
      showcase.css('visibility', 'visible');
      showcase.css('display', 'none');
      showcase.fadeIn( 1500, function() {
        $('#expand > button').one( 'click', showcaseExpand );
      } );

      setTimeout( function () {
        $('#expand > button').animate( { opacity: 1 }, 800 );
      }, 700 );
    }
  } );

  $('.nav-button').click( showcaseArrowClicked );

  showcaseInitSwipe();
}

function showcaseInitSwipe() {
  showcase
    .on( 'swiperight', function() { $('#nav-left').click(); } )
    .on( 'swipeleft',  function() { $('#nav-right').click(); } )
    .on( 'movestart',  function( e ) {
      // Unblock vertical scroll if swipe is more vertical than horizontal
      if( (e.distX > e.distY && e.distX < -e.distY) ||
          (e.distX < e.distY && e.distX > -e.distY) ) {
        e.preventDefault();
      }
    } );
}

function showcaseUpdated( showcase ) {
  $('#caption').text( showcase.nearestItem().alt );

  var c = Math.cos((showcase.floatIndex() % 1) * 2 * Math.PI);
  $('#caption').css( 'opacity', 0.5 + (0.5 * c) );
}

function showcaseArrowClicked( event ) {
  var hi = $( event.target ).closest( '.nav-button' ).find( '.blink-overlay' );

  // Flash button highlight
  hi.stop();
  hi.css( 'opacity', '0' );
  hi.css( 'display', 'block' );
  hi.animate( {'opacity': '0.7'}, 80, 'swing', function() {
    hi.animate( {'opacity': '0'}, 160, 'swing' );
  } );
}

//
// Expanded gallery
//

var GALLERY_MARGIN_HEADER = 32;
var GALLERY_MARGIN_FOOTER = 0;
var GALLERY_ITEM_MARGIN_X = 20;
var GALLERY_ROW_HEIGHT = 420;

var gallery = {
  rows: 0,
  height: GALLERY_MARGIN_HEADER + GALLERY_MARGIN_FOOTER,
  addRows: function( rows ) {
    this.rows += rows;
    this.height += rows * GALLERY_ROW_HEIGHT
  },
  grow: function( time ) {
    // Grow the container to accommodate the gallery
    showcase.stop( true ).animate( { height: this.height }, time );
  },
  rowY: function( rowNum ) {
    return GALLERY_MARGIN_HEADER + (rowNum * GALLERY_ROW_HEIGHT)
  },
  initSize: function() {
    // If the viewport is narrow, make gallery narrow
    this.width = Math.min( showcase.width(), $(window).width() );
    this.xOffset = ~~((showcase.width() - this.width) * 0.5);
  }
}

function sortByRows( items, rowWidth ) {
  var x = 0;
  var row = 0;
  var rowItems = [];
  var rowFree = rowWidth;

  $(items).each( function() {
    this.fullWidth = this.fullWidth || $(this).width();

    var w = this.fullWidth + (2 * GALLERY_ITEM_MARGIN_X);

    if( rowFree < w && rowItems.length !== 0 ) {
      row++;
      rowItems = [];
      rowFree = rowWidth;
    }

    this.galleryRow = row;

    // Place the left edge of the new item based on total space and how much
    // is already taken
    this.galleryX = rowWidth - (rowFree / 2) - (this.fullWidth / 2);

    // Shift items already in the row to accommodate the new one
    if( rowItems.length !== 0 ) {
      $(rowItems).each( function() {
        this.galleryX -= w / 2;
      } )
    }

    rowItems.push( this );
    rowFree -= w;
  } );

  return row + 1;
}

function itemAddInfo( item ) {
  item = $(item).addClass( 'gallery-item' );
  item.css( 'height', 'auto' );

  var img = item.find('img');
  item.append( '<p class="item-caption">' + img.attr('alt') + '</p>' );
  item.append( '<a class="buy" href="https://o.rbn.co/'
                + img.attr('data-ribbon-id')
                + '" target="_blank" style="opacity: 0">Buy</a>' );
  item.addClass( 'gallery-item' );

  //
  // Attach "info" tooltip
  //
  var tip_info = img.attr('data-info');
  var tip = '';

  if( tip_info !== undefined && tip_info != '' ) {
    var fields = ['Year', 'Width', 'Height', 'Depth'];
    tip_info = tip_info.split(' ');

    for( var idx in tip_info ) {
      if( idx == fields.length )
        break;

      if( tip_info[idx] != 'N/A' )
        tip += '<p><strong>' + fields[idx] + ':</strong> ' + tip_info[idx] + '</p>';
    }
  }

  if( tip !== '' ) {
    item.append('<div class="item-info" style="opacity: 0"></div>')
        .find('.item-info')
        .qtip( {
          content: tip,
          style: {
              classes: 'qtip-dark'
          },
          show: { event: 'click mouseover' },
          hide: { event: 'mouseout' }
    } );
  }

  //
  // Attach lightbox to PNG thumbnail so it can be zoomed to full size JPG
  //
  var a = img.wrap('<a href="' + img.attr('src').replace('thumbs/', '').replace('.png', '.jpg')
    + '" rel="gallery" title="' + img.attr('alt')
    + '"/>').parent();
  $(a).fancybox( {
    closeClick: true,
    openEffect: 'elastic',
    openSpeed: 720,
    overlay: { showEarly: true },
    prevEffect: 'none',
    nextEffect: 'none',
  } );

  item.hover( function() {
    item.find('.item-caption').stop().fadeTo( 200, 1 );
  }, function() {
    item.find('.item-caption').stop().fadeTo( 200, 0.8 );
  } );

  item.find('.buy, .item-info').stop().fadeTo( 333, 0.56 );
}

// Create gallery item from an image the same way Cloud9Carousel does
function galleryItemCreate( img ) {
  var reflection = $( $(img).reflect(mirrorOpts) ).next()[0];
  $(reflection).css('margin-top', mirrorOpts.gap + 'px');
  $(reflection).css('width', '100%');
  $(img).css('width', '100%');

  // reflect() wrapped the image in a container element
  var item = $(img).parent();

  // Save a reference to the main image
  item.img = img;

  return item;
}

function loadMoreGallery( file ) {
  // Show loading bar
  $("#loading-more").css( 'display', 'block' );

  $.get( file ).done( function( data ) {
    var items = [];

    // Add images to the DOM
    $(data).filter('img').each( function() {
      $('#showcase').append( this );
      $(this).css( 'visibility', 'hidden' );
      items.push( this );
    } );

    var count = items.length;

    // Wait until images are fully loaded...
    for( var i in items ) {
      $(items[i]).one( 'load', function() {
        if( --count === 0 ) {
          // Hide loading bar
          $("#loading-more").css( 'display', 'none' );

          for( var i in items ) {
            var item = items[i] = galleryItemCreate( items[i] );
            itemAddInfo( item );
          }

          var prevRows = gallery.rows;
          gallery.addRows( sortByRows( items, gallery.width ) );
          gallery.grow( 2000 );

          for( i in items ) {
            item = items[i];
            $(item).css( {
              'position': 'absolute',
              'visibility': 'visible',
              'left': item.galleryX + gallery.xOffset + 'px',
              'top': gallery.rowY( prevRows + item.galleryRow ) + 'px'
            } );
          }
        }
      } ).each( function() {
        // Cache fix for browsers that don't trigger .load()
        if( this.complete )
          $(this).trigger( 'load' );
      } );
    }
  } );
}

function showcaseExpand() {
  // Disable carousel operation
  showcase.data('carousel').deactivate();

  // Get carousel navigation items out of the way
  $('#expand').fadeOut( 1300 );
  $('#nav-buttons').fadeOut( 1300 );
  $('#caption').fadeOut( 1300 );
  $('#nav-left').animate( {'margin-right': '300px'}, 1300 );
  $('#nav-right').animate( {'margin-left': '344px'}, 1300 );
  infoWindowClose();

  var items = showcase.data('carousel').items;

  gallery.initSize();
  gallery.addRows( sortByRows( items, gallery.width ) );
  gallery.grow();

  $(items).each( function() {
    var item = this;
    var startX = this.x;
    var startY = this.y;
    var startScale = this.scale;
    var itemContainer = this.image.parentNode;

    $(itemContainer).removeClass( 'cloud9-item' );

    var destX = this.galleryX + gallery.xOffset;
    var destY = gallery.rowY( this.galleryRow );

    $({ i: 0 }).animate(
      { i: 2000 }, {
        duration: 2000,
        step: function( step ) {
          item.moveTo(
            startX + (destX - startX) * (step/2000),
            startY + (destY - startY) * (step/2000),
            startScale + (1.0 - startScale) * (step/2000)
          );
        },
        complete: function() {
          itemAddInfo( itemContainer );
        }
      }
    );
  });

  loadMoreGallery( 'gallery.html' );
}

//
// Info window
//

function infoWindowOpen( w, h ) {
  var win = $('#info-window');

  //
  // Create the info window if it hasn't been yet
  //
  if( win.length === 0 ) {
    win = $('<div id="info-window"><div id="content"></div><a id="close" title="Close"></a></div>').appendTo('#gallery');
    win.find('#close').click( infoWindowClose );
  } else {
    // Enable arrow keys in case they were disabled by the contact form showing
    arrowKeysEnabled = true;
  }

  var closeButton = win.find( '#close' ).css( 'display', 'none' );

  //
  // Appear the info window in a fancy fashion
  //
  var content = win.find( '#content' );
  content.children('div').hide();
  content.css( 'bottom', win.css( 'padding-bottom') );
  win.css( {
    'width': '0',
    'height': '0',
    'margin-left': '0',
    'opacity': '1',
    'display': 'block'
  } );
  win.stop( true ).animate(
    { width: w + 'px', 'margin-left': '-' + (w*0.5) + 'px' }, 600,
    function() {
      win.animate( { height: h + 'px' }, 600, function() {
        closeButton.fadeIn( 200 );
      } );
  } );
}

var infoWindowBusy = false;

function infoWindowClose() {
  if( !infoWindowBusy ) {
    arrowKeysEnabled = true;
    $('#info-window').stop( true ).fadeOut( 400 );
  }
}

function infoShow( file, contentId, w, h, onDone ) {
  infoWindowOpen( w, h );
  var content = $(contentId);

  function showContent() {
    content.stop( true ).fadeIn( 1200 );

    if( typeof onDone === 'function' )
      onDone( content );
  }

  if( content.length !== 0 ) {
    showContent();
  } else {
    //
    // Load the content, stat!
    //
    $.get( file, function( data ) {
      content = $('#info-window #content').append( data ).find( contentId );
      content.css('display', 'none');
      showContent();
    } );
  }
}

//
// Share on FB | Twitter | G+
//

function shareTabInit() {
  var share = $('#share').click( function() {
    if( !share.hasClass( 'open' ) ) {
      share.addClass( 'open' );
      share.animate( { 'margin-left': '-6px' }, 800 );
    }
  } );

  function shareTabClose() {
    if( share.hasClass( 'open' ) && !share.closing && !isFbPopupOpen( share ) ) {
      share.closing = true;
      share.stop( true ).animate( { 'margin-left': '-112px' }, 400, function() {
        share.closing = false;
        share.removeClass( 'open' );
      } );
    }
  }

  // Close tab when clicked if it's open
  $('#share .tab').click( shareTabClose );

  // Close tab on window scroll
  $(window).scroll( shareTabClose );

  // Close tab on gallery spin
  $('.nav-button').click( shareTabClose );

  // Close tab when clicked anywhere outside
  $('body').click( function( e ) {
    if( !($(e.target).is('#share') || $(e.target).closest('#share').length) )
      shareTabClose();
  } );
}

function isFbPopupOpen( parent ) {
  return parent.find( 'iframe.fb_ltr' ).hasClass( 'fb_iframe_widget_lift' );
}

//
// Keyboard events
//

// Contact form may disable the arrow keys so carousel doesn't spin while
// form inputs are being edited
var arrowKeysEnabled = true;

function keysInit() {
  $(document).keydown(function(e) {
    //
    // Codes: http://www.javascripter.net/faq/keycodes.htm
    //
    switch( e.keyCode ) {
      /* left arrow */
      case 37:
        arrowKeysEnabled && $('#nav-left').click();
        break;

      /* right arrow */
      case 39:
        arrowKeysEnabled && $('#nav-right').click();
        break;

      /* escape */
      case 27:
        infoWindowClose();
    }
  });
}

//
// Main
//

$(function() {
  showcaseInit();
  keysInit();

  $('#social a').mouseenter( function() {
    iconAnimate( $(this) );
  } );

  $('#menu #about').click( function() {
    infoShow( 'about.html', '#bio', 488, 200 );
  } );

  shareTabInit();
});