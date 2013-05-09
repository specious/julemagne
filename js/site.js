/* Aloha! */

$(function() {
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
	showcase.fadeIn(1000, 'swing');
})