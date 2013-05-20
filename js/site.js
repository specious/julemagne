/* Aloha! */

var GALLERY_ITEM_MARGIN_X = 20;
var GALLERY_ROW_HEIGHT = 330;
var GALLERY_TOP_OFFSET = 30;

function initShowcase() {
  var showcase = $("#showcase");

  showcase.CloudCarousel({
    xPos: 980 / 2,
    yPos: 50,
    yRadius: 480 / 10,
    reflHeight: 56,
    reflGap: 2,
    speed: 0.18,
    buttonLeft: $("#nav-left"),
    buttonRight: $("#nav-right"),
    titleBox: $("#art-title"),
    altBox: $("#art-alt")
  });

  // CloudCarousel messes it up on init
  $(".nav-button").css('display', 'inline-block');

  showcase.css('visibility', 'visible');
  showcase.css('display', 'none');
  showcase.fadeIn( 1000 );

  return showcase;
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

$(function() {
  var showcase = initShowcase();

  $('#author').click( function() {
    $('#contact-form').fadeIn( 800 );
  } );

  $('#expand > button').click( function() {
    // TODO: turn off carousel controls
    $("#expand").fadeOut( 1300 );
    $("#nav-buttons").fadeOut( 1300 );
    $("#nav-left").animate( {'margin-left': '-300px'}, 1300 );
    $("#nav-right").animate( {'margin-left': '344px'}, 1300 );

    var items = showcase.data('cloudcarousel').items;
    var spotX = 0, spotY = 0;

    var rows = sortByRows( items, showcase.width() );

    // Grow the container to accomodate the entire gallery
    showcase.animate(
      { height: GALLERY_TOP_OFFSET + (rows * GALLERY_ROW_HEIGHT) + 'px' },
      2000
    );

    $(items).each( function() {
      var item = this;
      var startX = this.x;
      var startY = this.y;
      var startScale = this.scale;

      var destX = this.galleryX;
      var destY = GALLERY_TOP_OFFSET + (this.galleryRow * GALLERY_ROW_HEIGHT);

      $({ i: 0 }).animate(
        { i: 2000 }, {
          duration: 2000,
          step: function( step ) {
            item.moveTo(
              startX + (destX - startX) * (step/2000),
              startY + (destY - startY) * (step/2000),
              startScale + (1.0 - startScale) * (step/2000)
            );
          }
        }
      );
    });
  } );
})