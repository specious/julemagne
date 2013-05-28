/* Aloha! */

var GALLERY_MARGIN_HEADER = 32;
var GALLERY_MARGIN_FOOTER = 12;
var GALLERY_ITEM_MARGIN_X = 20;
var GALLERY_ROW_HEIGHT = 330 + 64;

var showcase;

function initShowcase() {
  showcase = $("#showcase");

  showcase.CloudCarousel({
    xPos: 980 / 2,
    yPos: 50,
    yRadius: 480 / 10,
    reflHeight: 56,
    reflGap: 2,
    speed: 0.18,
    buttonLeft: $("#nav-left"),
    buttonRight: $("#nav-right"),
    onUpdated: showcaseUpdated
  });

  // CloudCarousel messes it up on init
  $(".nav-button").css('display', 'inline-block');

  showcase.css('visibility', 'visible');
  showcase.css('display', 'none');
  showcase.fadeIn( 1000, function() {
    $('#expand > button').click( showcaseExpand );
  } );
}

function showcaseUpdated( showcase ) {
  $('#art-title').html(
    $(showcase.nearestItem().image).attr('alt')
  );

  var c = Math.cos((showcase.floatIndex() % 1) * 2 * Math.PI);
  $('#art-title').css( 'opacity', 0.5 + (0.5 * c) );
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
    var w = this.galleryWidth = this.orgWidth + (2 * GALLERY_ITEM_MARGIN_X);

    if( rowFree - w < 0 && rowItems.length != 0 ) {
      row++;
      rowItems = [];
      rowFree = rowWidth;
    }

    this.galleryRow = row;

    // Place the left edge of the new item based on total space and how much
    // is already taken
    this.galleryX = rowWidth - (rowFree / 2) - (this.orgWidth / 2);

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

  // ...todo: halt carousel engine

  $('#expand').fadeOut( 1300 );
  $('#nav-buttons').fadeOut( 1300 );
  $('#art-title').fadeOut( 1300 );
  $('#nav-left').animate( {'margin-right': '300px'}, 1300 );
  $('#nav-right').animate( {'margin-left': '344px'}, 1300 );
  contactFormClose();

  var items = showcase.data('cloudcarousel').items;
  var spotX = 0, spotY = 0;

  var rows = sortByRows( items, showcase.width() );

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

    var destX = this.galleryX;
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
          artInfo = $(item.div).append( '<p class="art-info">' + item.alt + '</p>' );

          $(item.div).hover( function() {
            $(item.div).find('.art-info').fadeTo( 200, 1 );
          }, function() {
            $(item.div).find('.art-info').fadeTo( 200, 0.8 );
          } );
        }
      }
    );
  });
}

function showcaseMove( buttonId ) {
  // Trigger button "click"
  $( buttonId ).mouseup();

  // Flash button highlight
  var hi = $( buttonId + "-highlight" );
  hi.stop();
  hi.css( 'opacity', '0' );
  hi.css( 'display', 'block' );
  hi.animate( {'opacity': '0.5'}, 100, 'swing', function() {
    hi.animate( {'opacity': '0'}, 160, 'swing' );
  } );
}

//
// Main
//
$(function() {
  initShowcase();
})

$(document).keydown(function(e) {
  //
  // Codes: http://www.javascripter.net/faq/keycodes.htm
  //
  switch( e.keyCode ) {
    /* left arrow */
    case 37:
      if( typeof showcaseMove === 'function')
        showcaseMove( '#nav-left' );
      break;

    /* right arrow */
    case 39:
      if( typeof showcaseMove === 'function')
        showcaseMove( '#nav-right' );
      break;

    /* escape */
    case 27: 
      if( typeof contactFormClose === 'function')
        contactFormClose();
      break;
  }
});