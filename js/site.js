/* Aloha! */

function iconAnimate( icon ) {
  var i, h = icon.height(),
      x = icon.stop( true ).css('background-position').split(' ')[0],
      lastStep = -1;

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

function initShowcase() {
  showcase = $("#showcase");

  // Show 'loading...' animation
  showcase.loading = showcase.wrap( '<div id="loading-wrap"/>' ).parent();
  showcase.loading.animation = $( '<div id="loading"/>' ).prependTo( showcase.loading );

  showcase.Cloud9Carousel({
    xPos: showcase.width() / 2,
    yPos: 50,
    yRadius: 48,
    speed: 0.18,
    mirrorOptions: mirrorOpts,
    buttonLeft: $("#nav-left"),
    buttonRight: $("#nav-right"),
    bringToFront: true,
    onUpdated: showcaseUpdated,
    onLoaded: function() {
      showcase.loading.animation.fadeOut( 800, function() {
        showcase.loading.animation.remove();
        showcase.unwrap();
      } );

      showcase.css('visibility', 'visible');
      showcase.css('display', 'none');
      showcase.fadeIn( 1500, function() {
        $('#expand > button').one( 'click', showcaseExpand );
      } );

      setTimeout( function () {
        $('#expand > button').animate( { opacity: 1 }, 800 );
      }, 700 );
    }
  });

  // Carousel init messes up arrow buttons' 'display'
  $('.nav-button').css('display', 'inline-block');
  $('.nav-button').click( showcaseArrowClicked );
}

function showcaseUpdated( showcase ) {
  $('#art-title').html(
    $(showcase.nearestItem().image).attr('alt')
  );

  var c = Math.cos((showcase.floatIndex() % 1) * 2 * Math.PI);
  $('#art-title').css( 'opacity', 0.5 + (0.5 * c) );
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

    if( rowFree - w < 0 && rowItems.length !== 0 ) {
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

  item.append( '<p class="art-info">' + item.find('img').attr('alt') + '</p>' );
  item.addClass( 'gallery-item' );

  item.hover( function() {
    item.find('.art-info').fadeTo( 200, 1 );
  }, function() {
    item.find('.art-info').fadeTo( 200, 0.8 );
  } );
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
  $.get( file ).done( function( data ) {
    var items = [];

    // Add images to the DOM
    $(data).filter('img').each( function() {
      $('#showcase').children().first().append( this );
      $(this).css( 'visibility', 'hidden' );
      items.push( this );
    });

    var count = items.length;

    // Wait until images are fully loaded...
    for( var i in items ) {
      $(items[i]).one( 'load', function() {
        if( --count === 0 ) {
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
  showcase.data('cloud9carousel').halt();

  // Get carousel navigation items out of the way
  $('#expand').fadeOut( 1300 );
  $('#nav-buttons').fadeOut( 1300 );
  $('#art-title').fadeOut( 1300 );
  $('#nav-left').animate( {'margin-right': '300px'}, 1300 );
  $('#nav-right').animate( {'margin-left': '344px'}, 1300 );
  infoWindowClose();

  var items = showcase.data('cloud9carousel').items;

  gallery.initSize();
  gallery.addRows( sortByRows( items, gallery.width ) );
  gallery.grow();

  $(items).each( function() {
    var item = this;
    var startX = this.x;
    var startY = this.y;
    var startScale = this.scale;
    var itemContainer = item.image.parentNode;

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
// Keyboard events
//

function initKeys() {
  $(document).keydown(function(e) {
    //
    // Codes: http://www.javascripter.net/faq/keycodes.htm
    //
    switch( e.keyCode ) {
      /* left arrow */
      case 37:
        $('#nav-left').click();
        break;

      /* right arrow */
      case 39:
        $('#nav-right').click();
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
  initShowcase();
  initKeys();

  $('#social a').mouseenter( function() {
    iconAnimate( $(this) );
  } );

  $('#menu #about').click( function() {
    infoShow( 'about.html', '#bio', 488, 200 );
  } );
});