/**
 *
 * Header Text Animation .js
 *
 */


 /**
  * Call Animation init when page is loaded
  */
jQuery_2_1_3(window).load(function(){
	// if (jQuery_2_1_3("#typo").length){
	// 	jQuery_2_1_3("#typo").type("InterMine Registry", 500);
	// 	animText();
	// }
	animText();
});

/**
 * Animation Init
 * @element Container of text to animate. Has to be empty.
 * @text Text to Animate
 * @delay Delay time before animation starts
 *
 */
jQuery_2_1_3.fn.type = function(text, delay) {
	var element = jQuery_2_1_3(this);
	setInterval('cursorAnimation()', 100);
	setTimeout(function() { anim(element, text); }, delay);
}

// Cursor Animation
// function cursorAnimation() {
// 	if (jQuery_2_1_3("#cursor").length){
// 		jQuery_2_1_3("#cursor").animate({
// 			opacity: 0
// 		}, 'fast', 'swing').animate({
// 			opacity: 1
// 		}, 'fast', 'swing');
// 	}
// }
//
// // Title Animation
// function anim(element, text) {
// 	if (jQuery_2_1_3(element).html().length < text.length) {
// 		jQuery_2_1_3(element).html(text.substring(0, (jQuery_2_1_3(element).html().length + 1)));
// 		setTimeout(function() {
// 			anim(element, text);
// 		}, 1);
// 	}
// }

// Text Animation
function animText(){
	$('.header-text').animate({opacity: 1}, 'slow', 'linear');
}
