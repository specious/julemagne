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
// Showcase & gallery
//

var GALLERY_MARGIN_HEADER = 32;
var GALLERY_MARGIN_FOOTER = 12;
var GALLERY_ITEM_MARGIN_X = 20;
var GALLERY_ROW_HEIGHT = 404;

var showcase;

function initShowcase() {
  showcase = $("#showcase");

  showcase.Cloud9Carousel({
    xPos: showcase.width() / 2,
    yPos: 50,
    yRadius: 48,
    mirrorOptions: {
      gap: 3,
      height: 0.23
    },
    speed: 0.18,
    buttonLeft: $("#nav-left"),
    buttonRight: $("#nav-right"),
    onUpdated: showcaseUpdated,
    onLoaded: function() {
      showcase.css('visibility', 'visible');
      showcase.css('display', 'none');
      showcase.fadeIn( 1500, function() {
        $('#expand > button').click( showcaseExpand );
      } );
    }
  });

  // CloudCarousel messes it up on init
  $(".nav-button").css('display', 'inline-block');
}

function showcaseUpdated( showcase ) {
  $('#art-title').html(
    $(showcase.nearestItem().image).attr('alt')
  );

  var c = Math.cos((showcase.floatIndex() % 1) * 2 * Math.PI);
  $('#art-title').css( 'opacity', 0.5 + (0.5 * c) );
}

function sortByRows( items, rowWidth ) {
  var x = 0;
  var row = 0;
  var rowItems = [];
  var rowFree = rowWidth;

  $(items).each( function() {
    var w = this.galleryWidth = this.fullWidth + (2 * GALLERY_ITEM_MARGIN_X);

    if( rowFree - w < 0 && rowItems.length != 0 ) {
      row++;
      rowItems = [];
      rowFree = rowWidth;
    }

    this.galleryRow = row;

    // Place the left edge of the new item based on total space and how much
    // is already taken
    this.galleryX = rowWidth - (rowFree / 2) - (this.fullWidth / 2);

    // Shift items already in the row to accommodate the new one
    if( rowItems.length != 0 ) {
      $(rowItems).each( function() {
        this.galleryX -= w / 2;
      } )
    }

    rowItems.push( this );
    rowFree -= w;
  } );

  return row + 1;
}

function showcaseExpand() {
  // Turn off carousel controls
  showcaseMove = null;

  // Halt carousel
  showcase.data('cloud9carousel').stop();

  $('#expand').fadeOut( 1300 );
  $('#nav-buttons').fadeOut( 1300 );
  $('#art-title').fadeOut( 1300 );
  $('#nav-left').animate( {'margin-right': '300px'}, 1300 );
  $('#nav-right').animate( {'margin-left': '344px'}, 1300 );
  infoWindowClose();

  var items = showcase.data('cloud9carousel').items;
  var spotX = 0, spotY = 0;

  // If the viewport is narrow, make gallery narrow
  var newWidth = Math.min( showcase.width(), $(window).width() );
  var dX = ~~((showcase.width() - newWidth) * 0.5);

  var rows = sortByRows( items, newWidth );

  // Grow the container to accomodate the entire gallery
  showcase.animate(
    { height: GALLERY_MARGIN_HEADER
                + (rows * GALLERY_ROW_HEIGHT)
                + GALLERY_MARGIN_FOOTER + 'px' },
    2000
  );

  $(items).each( function() {
    var item = this;
    var startX = this.x;
    var startY = this.y;
    var startScale = this.scale;

    var destX = this.galleryX + dX;
    var destY = GALLERY_MARGIN_HEADER + (this.galleryRow * GALLERY_ROW_HEIGHT);

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
          var container = $(item.image.parentNode).addClass( 'gallery-item' );
          container.css( 'height', 'auto' );

          artInfo = container.append( '<p class="art-info">' + item.alt + '</p>' );
          container.addClass( 'gallery-item' );

          container.hover( function() {
            container.find('.art-info').fadeTo( 200, 1 );
          }, function() {
            container.find('.art-info').fadeTo( 200, 0.8 );
          } );
        }
      }
    );
  });
}

function showcaseMove( buttonId ) {
  // Trigger button "click" and get button highlight overlay
  var hi = $( buttonId ).click().find( '.shine-overlay' );

  // Flash button highlight
  hi.stop( true );
  hi.css( 'opacity', '0' );
  hi.css( 'display', 'block' );
  hi.animate( {'opacity': '0.7'}, 80, 'swing', function() {
    hi.animate( {'opacity': '0'}, 160, 'swing' );
  } );
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
    win = $('<div id="info-window"><div id="content"><a id="close" title="Close"></a></div></div>').appendTo('#gallery');
    win.find('#close').click( infoWindowClose );
  }

  //
  // Appear the info window in a fancy fashion
  //
  content = win.find( '#content' );
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
      win.animate( { height: h + 'px' }, 600 );
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
    // Load the contact form, stat!
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
        showcaseMove && showcaseMove( '#nav-left' );
        break;

      /* right arrow */
      case 39:
        showcaseMove && showcaseMove( '#nav-right' );
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
    infoShow( 'about.html', '#bio', 267, 82 );
  } );
});